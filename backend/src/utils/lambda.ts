import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import User from '../models/User';

// Configure Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/api/auth/google/callback',
        },
        async (
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            done: VerifyCallback
        ) => {
            try {
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(new Error('No email found in Google profile'), undefined);
                }

                // Check if user already exists
                let user = await User.findOne({ email: email.toLowerCase() });

                if (user) {
                    // User exists - update provider info if needed
                    if (user.provider === 'local') {
                        // Link Google account to existing email/password account
                        user.provider = 'google';
                        user.providerId = profile.id;
                        user.isVerified = true;

                        if (['karthikarthikeyan16401@gmail.com', 'logank7129@gmail.com'].includes(email.toLowerCase()) && user.role !== 'admin') {
                            user.role = 'admin';
                        }

                        await user.save();
                    } else {
                        // Even if provider is already google, check/upgrade admin role
                        if (['karthikarthikeyan16401@gmail.com', 'logank7129@gmail.com'].includes(email.toLowerCase()) && user.role !== 'admin') {
                            user.role = 'admin';
                            await user.save();
                        }
                    }
                } else {
                    // Create new user
                    user = new User({
                        name: profile.displayName || profile.name?.givenName || 'User',
                        email: email.toLowerCase(),
                        provider: 'google',
                        providerId: profile.id,
                        isVerified: true, // Google already verified the email
                        walletBalance: 1000, // Welcome bonus
                        role: ['karthikarthikeyan16401@gmail.com', 'logank7129@gmail.com'].includes(email.toLowerCase()) ? 'admin' : 'user',
                    });
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                console.error('Google OAuth Error:', error);
                return done(error as Error, undefined);
            }
        }
    )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
