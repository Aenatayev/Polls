import { supabase } from '../lib/supabase';
import { compress } from 'zlib';
import { promisify } from 'util';

const gzip = promisify(compress);

interface TableData {
  [key: string]: any[];
}

interface SyncResult {
  success: boolean;
  message: string;
  timestamp: string;
  data?: any;
}

/**
 * Fetches data from all public tables in Supabase in parallel
 */
async function fetchAllTableData(): Promise<TableData> {
  const tables = [
    'polls',
    'questions',
    'responses',
    'surveys',
    'survey_questions',
    'survey_responses',
    'form_templates',
    'form_sections',
    'form_validations',
    'form_themes'
  ];

  try {
    console.log('\x1b[36mFetching data from Supabase tables...\x1b[0m');
    
    const fetchPromises = tables.map(async (table) => {
      try {
        const { data: tableData, error } = await supabase
          .from(table)
          .select('*')
          .eq('is_public', true)
          .limit(1000); // Prevent memory issues

        if (error) {
          console.error(`\x1b[31mError fetching ${table}:\x1b[0m`, error);
          return { [table]: [] };
        }

        // Remove sensitive data
        const sanitizedData = tableData.map(({ user_id, email, password_hash, ...rest }) => rest);
        console.log(`\x1b[32m✓ Fetched ${sanitizedData.length} rows from ${table}\x1b[0m`);
        return { [table]: sanitizedData };
      } catch (err) {
        console.error(`\x1b[31mError processing ${table}:\x1b[0m`, err);
        return { [table]: [] };
      }
    });

    const results = await Promise.all(fetchPromises);
    return Object.assign({}, ...results);
  } catch (err) {
    console.error('\x1b[31mError fetching data:\x1b[0m', err);
    throw err;
  }
}

/**
 * Formats and compresses data for GitHub storage
 */
async function formatDataForGithub(data: TableData): Promise<string> {
  // Remove any sensitive or unnecessary data
  const sanitizedData = Object.entries(data).reduce((acc, [table, rows]) => {
    acc[table] = rows.map(row => {
      const { password, token, secret, ...rest } = row;
      return rest;
    });
    return acc;
  }, {} as TableData);

  // Compress the data
  const jsonData = JSON.stringify(sanitizedData, null, 2);
  const compressedData = await gzip(Buffer.from(jsonData));
  return compressedData.toString('base64');
}

/**
 * Pushes data to GitHub with proper error handling
 */
async function pushToGithub(content: string, githubToken: string): Promise<any> {
  const owner = 'Aenatayev';
  const repo = 'Hub';
  const path = 'data/supabase-export.json';
  const branch = 'main';
  
  try {
    console.log('\x1b[36mChecking for existing file on GitHub...\x1b[0m');
    
    // Get existing file (if it exists)
    const getResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      }
    );

    let sha: string | undefined;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
      console.log('\x1b[32m✓ Found existing file\x1b[0m');
    }

    console.log('\x1b[36mPushing data to GitHub...\x1b[0m');

    // Update or create the file
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: 'Update Supabase data export',
          content: content,
          branch,
          sha // Include SHA if file exists
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
    }

    console.log('\x1b[32m✓ Successfully pushed to GitHub\x1b[0m');
    return await response.json();
  } catch (error) {
    console.error('\x1b[31mError pushing to GitHub:\x1b[0m', error);
    throw error;
  }
}

/**
 * Main sync function that orchestrates the entire process
 */
export async function syncToGithub(githubToken: string): Promise<SyncResult> {
  try {
    console.log('\x1b[36m🔄 Starting Supabase to GitHub sync...\x1b[0m');
    
    // Fetch data from Supabase
    console.log('\x1b[36m📥 Fetching data from Supabase...\x1b[0m');
    const data = await fetchAllTableData();
    console.log('\x1b[32m✓ Data fetched successfully\x1b[0m');

    // Format and compress data for GitHub
    console.log('\x1b[36m📝 Formatting and compressing data...\x1b[0m');
    const formattedData = await formatDataForGithub(data);
    console.log('\x1b[32m✓ Data formatted and compressed\x1b[0m');

    // Push to GitHub
    console.log('\x1b[36m🚀 Pushing data to GitHub...\x1b[0m');
    const result = await pushToGithub(formattedData, githubToken);
    console.log('\x1b[32m✓ Data successfully pushed to GitHub\x1b[0m');

    return {
      success: true,
      message: 'Sync completed successfully',
      timestamp: new Date().toISOString(),
      data: result
    };
  } catch (error) {
    console.error('\x1b[31m❌ Sync failed:\x1b[0m', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
  }
}