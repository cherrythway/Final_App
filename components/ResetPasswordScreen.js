import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { auth } from '../firebase';
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";

const ResetPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

    const handlePasswordReset = () => {
        if (email === '') {
            alert('Please enter your email address');
            return;
        }

        auth.fetchSignInMethodsForEmail(email)
            .then((signInMethods) => {
                if (signInMethods.length > 0) {
                    // Email exists, send the reset email
                    sendPasswordResetEmail(auth, email)
                        .then(() => {
                            alert('Password reset email sent!');
                            navigation.navigate('SignInScreen');
                        })
                        .catch(error => alert(error.message));
                } else {
                    // Email does not exist
                    alert('No account found with this email.');
                }
            })
            .catch(error => alert(error.message));
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior='padding'>
            <View style={styles.textInputContainer}>
                <TextInput
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.textInput}
                    placeholderTextColor="#aaa"
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={handlePasswordReset}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Send Reset Email</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Remember your password?</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('SignInScreen')}
                    style={styles.signInButton}
                >
                    <Text style={styles.signInButtonText}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

export default ResetPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#F0F8FF', 
        paddingHorizontal: 20,
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
    buttonContainer: {
        width: '100%',
    },
    button: {
        backgroundColor: '#4169E1',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    signInContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    signInText: {
        color: '#333',
        fontSize: 16,
    },
    signInButton: {
        paddingLeft: 10,
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
});
