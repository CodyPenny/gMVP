import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";

import { getStorage } from "firebase/storage";
//import 'firebase/analytics'

/**
 * Lets the app know which Google Firebase server the app should talk to
 */

const config = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};


/**
 * Remove this later
 * For debugging purposes
 */

//window.firebase = firebase;

/**
 * Firebase Solutions
 */

const streakApp = initializeApp(config);
export const db = getFirestore(streakApp);
export const storage = getStorage(streakApp);
export const auth = getAuth();
export const provider = new GoogleAuthProvider();


/**
 * 
 * @returns 
 */
export const signInWithGoogle = () => signInWithPopup(auth, provider);

/**
 * 
 * @param {*} email 
 * @param {*} password 
 * @returns 
 */
export const signInWithEmail = async (email, password) =>
  await signInWithEmailAndPassword(auth, email, password);


/**
 * Authenticates with Firebase
 * Stores the token in session storage
 * @param {*} email 
 * @param {*} password 
 * @returns user's token and authentication to UsersProvider
 */
export const registerWithEmailAndPassword = async ( email, password ) =>{
  console.log('registering')
  let user =  await createUserWithEmailAndPassword(auth, email, password)
  sessionStorage.setItem('Auth Token', user._tokenResponse.refreshToken)
  return user.user
}

/**
 * 
 * @param {*} email 
 * @returns 
 */
export const resetPasswordWithEmail = (email) =>
  auth.sendPasswordResetEmail(email);

  export const signOutOfApp = () => signOut(auth)


/**
 * Accesses the firestore database
 * @param {*} collection 
 * @param {*} UID 
 * @returns document object matching the UID
 */
export const getRef = (collection, UID) => {
  return doc( db, collection, UID )
}

/**
 * 
 * @param {*} docRef 
 * @param {*} updates 
 * @returns 
 */
const performUpdate = async (docRef, updates) =>
  await docRef.update({ ...updates });


/**
 * Creates a new user document with firebase
 * @param {*} user 
 * @param {*} additionalData 
 * @returns new user document
 */
export const createUserProfileDocument = async (user) => {

  if (!user) return;
  
  try {
    const { email, photoURL, displayName } = user;
    const createdAt = new Date();
    const uRef = doc(db, "users", user.uid)
    await setDoc( uRef , {
      email,
      photoURL,
      displayName,
      createdAt
    })

    const uDoc = await getDoc( uRef );

    // if (!uDoc.exists) {

      // await uRef.set({
      //   displayName,
      //   email,
      //   photoURL,
      //   createdAt,
      //   ...additionalData
      // });
    //   await setDoc( uRef, {
    //     displayName,
    //     email,
    //     photoURL,
    //     createdAt,
    //     ...additionalData
    //   } )
    // }

    return await getUserDocument(user.uid);
  } catch (error) {
    console.error('createUserProfileDocument Error:', error);
    return 'createUserProfileDocument Error';
  }
};

/**
 * 
 * @param {*} UID user's firestore unique ID
 * @returns 
 */
export const getUserDocument = async (UID) => {
  if (!UID) return null;

  const uRef = getRef('users', UID);

  try {
      const uDoc = await getDoc( uRef );

    //TODO: add default friends
    // if (uDoc.data().friends === undefined) {
    //   const updates = {
    //     friends: { [UID]: 2, C8gVA1A8ddcaQnawSKoJMVUOTRv2: 1 },
    //     challenges: [],
    //     completed: 0,
    //     wins: 0
    //   };

    //   await performUpdate(uRef, updates);
    // }

    return uRef;
  } catch (error) {
    console.error('getUserDocument Error:', error);
    return 'getUserDocument Error';
  }
};


/**
 * 
 * @param {*} UID 
 * @returns 
 */

export const getUser = async (UID) => {
  if (!UID) return null;

  try {
    const fRef = getRef('users', UID);
    const fDoc = await fRef.get();


    return fDoc.data();
  } catch (error) {
    console.error('getUserDocument Error:', error);
    return 'getUserDocument Error';
  }
};

export const getChallenge = async (challengeUID) => {
  if (!challengeUID) return null;

  try {
    const cRef = getRef('challenges', challengeUID);
    const cDoc = await cRef.get();

    return cDoc.data();
  } catch (error) {
    console.error('getChallenge Error:', error);
    return error;
  }
};

export const addFriend = async (UID, friendUID) => {
  if (!UID || !friendUID) return null;

  const uRef = getRef('users', UID);
  const fRef = getRef('users', friendUID);

  try {
    const fDoc = await fRef.get();

    if (fDoc.exists) {
      const uDoc = await uRef.get();
      const userUpdates = {
        friends: { ...{ [friendUID]: 1 }, ...uDoc.data().friends }
      };
      const friendUpdates = {
        friends: { ...{ [UID]: 1 }, ...fDoc.data().friends }
      };

      await Promise.all([
        performUpdate(uRef, userUpdates),
        performUpdate(fRef, friendUpdates)
      ]);

      return fDoc.data().displayName;
    }

    return false;
  } catch (error) {
    console.error('addFriend Error:', error);
    return 'addFriend Error';
  }
};

export const editProfile = async (UID, field) => {
  if (!UID) return null;

  const uRef = getRef('users', UID);

  try {
    if (Object.keys(field)[0] === 'displayName') {
      const updates = { displayName: field.displayName };
      await performUpdate(uRef, updates);

      return field.displayName;
    }

    return 'editProfile Error #1';
  } catch (error) {
    console.error('editProfile Error:', error);
    return 'editProfile Error #2';
  }
};

/**
 * Challenge Related Functionality
 */

export const createChallengeProfileDocument = async (
  challenge,
  additionalData
) => {
  if (!challenge) return;

  try {
    let cRef = await db
      .collection('challenges')
      .add({ ...challenge, ...additionalData });

    const CUID = cRef.id;

    cRef = getRef('challenges', CUID);

    const cDoc = await cRef.get();

    let firstPlace = await getUser(auth.currentUser.uid);

    if (cDoc.data().CUID === '') {
      const updates = {
        CUID,
        members: { [auth.currentUser.uid]: { currentStreak: 0 } },
        memberCount: 1,
        firstPlace: firstPlace.displayName
      };
      await performUpdate(cRef, updates);

      return CUID;
    } else {
      return cRef;
    }
  } catch (error) {
    console.error('createChallengeProfileDocument Error:', error);
    return 'createChallengeProfileDocument Error';
  }
};

export const setUserChallenges = async (CUID, UID) => {
  if (!CUID || !UID) return;

  const uRef = getRef('users', UID);

  try {
    const uDoc = await uRef.get();
    const updates = { challenges: [CUID, ...uDoc.data().challenges] };
    await performUpdate(uRef, updates);

    return;
  } catch (error) {
    console.error('setUserChallenges Error:', error);
    return ' setUserChallenges Error';
  }
};

export const challengeAdjustMember = async (CUID, UID, additionalData) => {
  if (!CUID || !UID) return;

  try {
    const cRef = getRef('challenges', CUID);
    const cDoc = await cRef.get();

    if (cDoc.data().members[UID] === undefined) {
      const updates = {
        members: { ...{ [UID]: { currentStreak: 0 } }, ...cDoc.data().members },
        memberCount: cDoc.data().memberCount + 1
      };
      await performUpdate(cRef, updates);
    }

    return;
  } catch (error) {
    console.error('challengeAddNewMember Error:', error);
    return 'challengeAddNewMember Error';
  }
};

export const challengeCheckIn = async (CUID, UID) => {
  if (!CUID || !UID) return;

  const cRef = getRef('challenges', CUID);

  try {
    const cDoc = await cRef.get();

    const userCurrentStreak = cDoc.data().members[UID].currentStreak;
    const challengeDuration = parseInt(cDoc.data().duration);
    const allMembers = cDoc.data().members;

    var newStreak;
    var firstPlace;
    var firstPlaceStreaks = -1;

    for (let member of Object.keys(allMembers)) {
      if (allMembers[member].currentStreak > firstPlaceStreaks) {
        firstPlaceStreaks = allMembers[member].currentStreak;
        firstPlace = member;
      }
    }

    firstPlace = await getUser(firstPlace);

    if (userCurrentStreak < challengeDuration) {
      newStreak = userCurrentStreak + 1;
    } else {
      newStreak = userCurrentStreak;
    }

    const updates = {
      members: {
        ...cDoc.data().members,
        [UID]: { currentStreak: newStreak }
      },
      firstPlace: firstPlace.displayName
    };

    await performUpdate(cRef, updates);

    return;
  } catch (error) {
    console.error('challengeCheckIn Error:', error);
    return ' challengeCheckIn Error';
  }
};

