import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(req) {
  try {
    const { userId } = await req.json();

    // Ensure userId is passed
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Path to the Python script and Python executable
    const pythonScript = 'path_to_your_script/app.py'; // Adjust this path
    const pythonExecutable = 'python';  // or 'python3', depending on your environment

    // Call the Python script asynchronously
    exec(`${pythonExecutable} ${pythonScript}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing Python script:', error);
        return;
      }
      if (stderr) {
        console.error('stderr:', stderr);
        return;
      }
      console.log('Python script output:', stdout);
    });

    // Send a response back to indicate the process was triggered
    return NextResponse.json({ message: 'Model execution started successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Error in API execution:', error);
    return NextResponse.json({ error: 'Failed to execute model.' }, { status: 500 });
  }
}
