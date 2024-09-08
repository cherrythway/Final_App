import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { AntDesign } from '@expo/vector-icons'; 

const SignUpScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();

    const handleSignUp = () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredentials => {
                const user = userCredentials.user;
                console.log('Registered with:', user.email);
                navigation.replace('Home');
            })
            .catch(error => alert(error.message));
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior='padding'>
            <Image 
                source={require('../assets/PlanNow.png')} 
                style={styles.logo}
            />
            <View style={styles.textInputContainer}>
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
                <View style={styles.confirmPasswordContainer}>
                    <TextInput
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={text => setConfirmPassword(text)}
                        style={styles.textInputWithIcon}
                        secureTextEntry
                        placeholderTextColor="#aaa"
                    />
                    {confirmPassword.length > 0 && (
                        <TouchableOpacity onPress={() => handleSignUp()} style={styles.icon}>
                            <AntDesign name="arrowright" size={24} color="#4169E1" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.signInAccount}>
                <Text style={styles.backToSignInText}>Already have an account?</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('SignInScreen')}
                    style={styles.backToSignIn}
                    activeOpacity={0.7}
                >
                    <Text style={styles.resetText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

export default SignUpScreen;

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
    },
    textInputContainer: {
        width: "100%",
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
    confirmPasswordContainer: {
        position: 'relative',
    },
    textInputWithIcon: {
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
    icon: {
        position: 'absolute',
        right: 20,
        top: 10,
        borderWidth: 1,
        borderRadius: 50,
        borderColor: '#B0C4DE',
        padding: 8,
    },
    signInAccount: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        margin: 10,
    },
    backToSignIn: {
        paddingLeft: 10,
    },
    backToSignInText: {
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
