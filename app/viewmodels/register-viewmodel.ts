export const registerUser = async (
    fullName: string,
    email: string,
    password: string
): Promise<{ success: boolean; message: string }> => {
    if (!fullName || !email || !password) {
        return { success: false, message: 'Please fill in all fields' };
    }

    try {
        const response = await fetch('http://192.168.249.5:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: fullName,
                email: email,
                password: password,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, message: 'Registration successful!' };
        } else {
            return { success: false, message: data.error || 'Registration failed.' };
        }
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, message: 'Server error. Please try again later.' };
    }
};
