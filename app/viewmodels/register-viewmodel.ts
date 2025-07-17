import config from '@/config';

export const registerUser = async (
  fullName: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  if (!fullName || !email || !password) {
    return { success: false, message: 'Please fill in all fields' };
  }

  try {
    const response = await fetch(config.API.REGISTER_USER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fullName,
        email,
        password,
      }),
    });

    const data = await response.json();

    return response.ok
      ? { success: true, message: 'Registration successful!' }
      : { success: false, message: data.error || 'Registration failed.' };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Server error. Please try again later.' };
  }
};
