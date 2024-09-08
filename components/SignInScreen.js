import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons  } from '@expo/vector-icons';


const SignInScreen = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                navigation.replace("Home");
            }
        });
        return unsubscribe;
    }, []);

    const handleSignIn = () => {
        auth.signInWithEmailAndPassword(email, password)
            .then(userCredentials => {
                const user = userCredentials.user;
                console.log(user.email);
            })
            .catch(error => alert(error.message));
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior='padding'>
            <Image 
                source={require('../assets/PlanNow.png')} 
                style={styles.logo}
            />
            <View style={styles.formContainer}>
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.textInput}
                    placeholderTextColor="#aaa"
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={styles.textInput}
                    secureTextEntry
                    placeholderTextColor="#aaa"
                />
                {password.length > 0 && (
                    <TouchableOpacity
                        onPress={handleSignIn}
                        style={styles.arrowIcon}
                        testID="signInButton"
                        activeOpacity={0.7}
                    >
                    <Ionicons name="arrow-forward" size={25} color="#4169E1"/>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.resetPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                <TouchableOpacity
                onPress={() => navigation.navigate('ResetPasswordScreen')}
                style={styles.forgotPassword}
                >
                    <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.createAccount}>
                <Text style={styles.signUpText}>Do not have an account?</Text>
                <TouchableOpacity
                onPress={() => navigation.navigate('SignUpScreen')}
                style={styles.signUp}
                >
                    <Text style={styles.resetText}>Sign Up</Text>
                </TouchableOpacity>
            </View>

        </KeyboardAvoidingView>
    );
}

export default SignInScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#F0F8FF', 
        paddingHorizontal: 20,
    },
    logo: {
        width: 200,
        height: 80,
        paddingHorizontal: 20,
    },
    formContainer: {
        width: '100%',
    },
    textInput: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#B0C4DE',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2, 
    },
    arrowIcon: {
        position: 'absolute',
        right: 10,
        top: '56%',
        borderWidth: 1,
        borderRadius: 50,
        borderColor: '#B0C4DE',
        padding: 8,
    },
    resetPassword:{
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        margin: 10,
    },
    forgotPassword: {
        paddingLeft: 10,
    },
    forgotPasswordText: {
        color: '#333',
        fontSize: 16,
        textAlign: "center",
    },
    createAccount:{
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        margin: 10,
    },
    signUp: {
        paddingLeft: 10,
    },
    signUpText: {
        color: '#333',
        fontSize: 16,
        textAlign: "center",
    },
    resetText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        textDecorationLine:'underline',
    },
});
