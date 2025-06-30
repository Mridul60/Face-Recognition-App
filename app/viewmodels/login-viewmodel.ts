export const loginUser = async (
    email: string,
    password: string
): Promise<{ success: boolean; message: string; token?: string }> => {
    if (!email || !password) {
        return { success: false, message: 'Please fill in all fields' };
    }

    try {
        const response = await fetch('http://192.168.195.5:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });


        const data = await response.json();

        if (response.ok) {
            return {
                success: true,
                message: 'Login successful!',
                token: data.token, // assuming your backend sends back a JWT token
            };
        } else {
            return { success: false, message: data.message || 'Login failed.' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Server error. Please try again later.' };
    }
};
