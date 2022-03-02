import React, { Component, createContext } from 'react';
import { auth, createUserProfileDocument, getRef } from '../firebase.js';
import  { onAuthStateChanged } from "firebase/auth";
import { onSnapshot } from 'firebase/firestore';


export const UserContext = createContext({});

/**
 * Runs on website load for user state
 * On register, a new user document is created once the users new username and pw is authenticated
 * Uses an observer that gets called whenever the user's sign-in state changes
 */
class UsersProvider extends Component {
  state = { user: null };
  unsubscribeFromAuth = null;

  /*
  * userAuth can come in as null or some truthy value
  * Null is when the user logs out, so we'll set that user state to null
  *   when the user logs out
  *
  * When userAuth is truthy, we want to get the location of the
  *   user's data in the database stored
  * Then we subscribe/listen to any further changes at that location
  *   and update state accordingly
  */
  // authObserver =  () => {
  //   this.unsubscribeFromAuth = onAuthStateChanged( auth, (user ) => {
  //     if (user) {
  //       // user is sign in
  //       // try {
  //         // await onSnapshot( getRef('users', user.uid), doc => {
  //         //   this.setState({ 
  //         //     user: { uid: doc.id, 
  //         //             ...doc.data() 
  //         //           } 
  //         //   })
  //         console.log('user in user provider ', user)
  //         this.setState({ 
  //               user: { uid: user.uid,
  //               email: user.email,
  //               displayName: user.displayName,
  //               photoURL: user.photoURL
  //                } 
  //             })
      
          
  //       // } catch (error) {
  //       //   console.log('error', error)
  //       // }


  //       // creates a new user, why?
  //       // const userReference = await createUserProfileDocument(userAuth);
  //       // console.log('user provider 36 ', userReference)

  //       // userReference.onSnapshot((snapshot) => {
  //       //   this.setState({ user: { uid: snapshot.id, ...snapshot.data() } });
  //       // });

  //     } else {
  //       // user is signed out
  //       //this.setState({ user: userAuth });
  //     }
  //   });
  // }

  componentDidMount = () => {

    //this.authObserver()
    this.unsubscribeFromAuth = onAuthStateChanged( auth, (user ) => {
      if (user) {
       
          console.log('user in user provider ', user)
          this.setState({ 
                user: { uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
                 } 
              })
      

      } else {
        // user is signed out
        //this.setState({ user: userAuth });
      }
    })
  
  };

  /**
   * Unsubscribe, remove auth listener
   */
  componentWillUnmount = () => {
   this.unsubscribeFromAuth();
  };

  render() {
    const { children } = this.props;

    return <UserContext.Provider value={this.state.user}>{children}</UserContext.Provider>;
  }
}

export default UsersProvider;
