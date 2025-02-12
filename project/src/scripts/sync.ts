import 'dotenv/config';
import { syncToGithub } from '../utils/syncToGithub';

// Get GitHub token from environment variable
const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  console.error('\x1b[31mError: GITHUB_TOKEN environment variable is required\x1b[0m');
  process.exitCode = 1;
} else {
  console.log('\x1b[36mStarting sync process...\x1b[0m');

  // Run the sync
  syncToGithub(githubToken)
    .then((result) => {
      if (!result || typeof result.success === 'undefined') {
        console.error('\x1b[31mError: Unexpected response from syncToGithub\x1b[0m');
        console.error('Response:', result);
        process.exitCode = 1;
        return;
      }

      if (result.success) {
        console.log('\x1b[32mSync completed successfully!\x1b[0m');
        console.log('Timestamp:', result.timestamp);
        if (result.message) {
          console.log('Message:', result.message);
        }
      } else {
        console.error('\x1b[31mSync failed!\x1b[0m');
        console.error('Error:', result.message);
        console.error('Timestamp:', result.timestamp);
        process.exitCode = 1;
      }
    })
    .catch((error) => {
      console.error('\x1b[31mSync error:\x1b[0m');
      console.error(error);
      if (error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
      process.exitCode = 1;
    });