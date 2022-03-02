import React, { Component, createContext } from 'react';
import { auth, createUserProfileDocument, takeSnapShot } from '../firebase.js';
import  { onAuthStateChanged } from "firebase/auth";


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
  authObserver =  () => {
    this.unsubscribeFromAuth = onAuthStateChanged( auth, async (userAuth ) => {

      console.log('in users provider', userAuth)

      if (userAuth) {
        // user is sign in
        //this.setState({ user: userAuth });
        let newData = await takeSnapShot( userAuth.uid )
        this.setState({ user: newData })
        console.log('taking snap shot')


        // creates a new user, why?
        // const userReference = await createUserProfileDocument(userAuth);
        // console.log('user provider 36 ', userReference)

        // userReference.onSnapshot((snapshot) => {
        //   this.setState({ user: { uid: snapshot.id, ...snapshot.data() } });
        // });

      } else {
        // user is signed out
      }
    });
  }

  componentDidMount = () => {

    this.authObserver()
    
  };

  componentWillUnmount = () => {
    this.unsubscribeFromAuth();
  };

  render() {
    const { user } = this.state;
    const { children } = this.props;

    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
  }
}

export default UsersProvider;
