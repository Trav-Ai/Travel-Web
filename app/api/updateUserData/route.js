import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const defaultUserData = {
  currentLocation: '',
  likedLocations: [],
  addedLocations: [],
  visitedLocations: [],
  recommended: [],
};

export async function POST(req) {
  try {
    const { userId, location, action } = await req.json();

    if (!userId || !location || !action) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Path to the JSON file
    const filePath = path.join(process.cwd(), 'public/userData/userData.json');

    // Check if the user data file exists
    if (!fs.existsSync(filePath)) {
      // Create the file if it doesn't exist
      const initialData = { [userId]: defaultUserData };
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    }

    // Read the JSON file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Ensure the structure for the userId exists
    if (!data[userId]) {
      data[userId] = { ...defaultUserData };
    }

    // Ensure correct structure (if any property is missing or wrong type)
    Object.keys(defaultUserData).forEach((key) => {
      if (!Array.isArray(data[userId][key])) {
        data[userId][key] = Array.isArray(defaultUserData[key])
          ? defaultUserData[key]
          : '';
      }
    });

    // Update the appropriate array based on the action
    if (data[userId]) {
      if (action === 'add') {
        if (!data[userId].addedLocations.includes(location)) {
          data[userId].addedLocations.push(location);
        }
      } else if (action === 'remove') {
        data[userId].addedLocations = data[userId].addedLocations.filter(
          (loc) => loc !== location
        );
      } else if (action === 'like') {
        if (!data[userId].likedLocations.includes(location)) {
          data[userId].likedLocations.push(location);
        }
      } else if (action === 'removeLike') {
        data[userId].likedLocations = data[userId].likedLocations.filter(
          (loc) => loc !== location
        );
      } else if (action === 'visit') {
        if (!data[userId].visitedLocations.includes(location)) {
          data[userId].visitedLocations.push(location);
        }
      } else if (action === 'removeVisit') {
        data[userId].visitedLocations = data[userId].visitedLocations.filter(
          (loc) => loc !== location
        );
      } else {
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json(
      { message: 'User data updated successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update user data.' },
      { status: 500 }
    );
  }
}
