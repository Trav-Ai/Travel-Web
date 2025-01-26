import { NextResponse } from 'next/server';
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, writeBatch, arrayUnion, arrayRemove, select } from "firebase/firestore";

export async function POST(req) {
    try {
        const { userID, location, action } = await req.json();

        if (!userID || !location || !action) {
            return NextResponse.json(
                { error: 'Missing required fields.' },
                { status: 400 }
            );
        }

        // Fetch specific fields (likedLocations, visitedLocations, addedLocations) from Firestore
        const userDocRef = doc(db, "users", userID);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        const userData = userDocSnap.data();

        // Initialize Firestore batch for atomic updates
        const batch = writeBatch(db);

        // Ensure arrays exist, if not, initialize them
        const updatedUserData = {
            ...userData,
            likedLocations: userData.likedLocations || [],
            visitedLocations: userData.visitedLocations || [],
            addedLocations: userData.addedLocations || [],
        };

        // Perform action based on the request
        switch (action) {
            case 'add':
                if (!updatedUserData.addedLocations.includes(location)) {
                    batch.update(userDocRef, {
                        addedLocations: arrayUnion(location),
                    });
                }
                break;
            case 'remove':
                batch.update(userDocRef, {
                    addedLocations: arrayRemove(location),
                });
                break;
            case 'like':
                if (!updatedUserData.likedLocations.includes(location)) {
                    batch.update(userDocRef, {
                        likedLocations: arrayUnion(location),
                    });
                }
                break;
            case 'removeLike':
                batch.update(userDocRef, {
                    likedLocations: arrayRemove(location),
                });
                break;
            case 'visit':
                if (!updatedUserData.visitedLocations.includes(location)) {
                    batch.update(userDocRef, {
                        visitedLocations: arrayUnion(location),
                    });
                }
                break;
            case 'removeVisit':
                batch.update(userDocRef, {
                    visitedLocations: arrayRemove(location),
                });
                break;
            default:
                return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
        }

        // Commit the batch update
        await batch.commit();

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
