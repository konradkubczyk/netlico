const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserData = require("../schema/user");

class User {
    #id;
    #email;
    #emailVerified;
    #hashedPassword;
    #websites;
    #isAdmin;

    static #jwtSecret = process.env.JWT_SECRET;

    static async register(email, plainPassword) {
        let user;

        try {
            const hashedPassword = await bcryptjs.hash(plainPassword, 10);
            user = new UserData({
                email: email,
                hashedPassword: hashedPassword
            });
        } catch (error) {
            throw {
                status: 500,
                message: 'Could not hash the password'
            };
        }

        try {
            await user.save();

            return {
                status: 201,
                message: 'Account created successfully'
            }

        } catch (error) {
            throw {
                status: 500,
                message: 'Email already in use'
            }
        }
    }

    static async logIn(email, plainPassword) {
        let user;
        
        try {
            user = await UserData.findOne({
                email: email
            });

            if (!user) {
                throw new Error('Could not find an account associated with the provided email address');
            }
        } catch (error) {
            throw {
                status: 400,
                message: 'Account does not exist'
            }
        }

        const isPasswordCorrect = await bcryptjs.compare(plainPassword, user.hashedPassword);

        if (isPasswordCorrect) {
            const authToken = jwt.sign(
                {
                    id: user._id,
                    email: user.email
                },
                this.#jwtSecret,
                {
                    expiresIn: '24h'
                }
            );

            return authToken;
        } else {
            throw {
                status: 400,
                message: 'Incorrect password'
            }
        }
    }

    constructor(userId) {
        this.#id = userId;
    }

    async loadUserData() {
        const userData = await UserData.findById(this.id);
        this.#email = userData.email;
        this.#emailVerified = userData.emailVerified;
        this.#hashedPassword = userData.hashedPassword;
        this.#websites = userData.websites;
        this.#isAdmin = userData.isAdmin;
    }
    
    async delete() {
        try {
            await UserData.findByIdAndRemove(this.id);
            return {
                status: 200,
                message: 'Account deleted successfully'
            }
        } catch (error) {
            throw {
                status: 500,
                message: 'Could not delete user data'
            }
        }
    }

    get id() {
        if (typeof this.#id !== 'undefined') {
            return this.#id;
        }
        return (async () => {
            await this.loadUserData();
            return this.#id;
        })();
    }

    get email() {
        if (typeof this.#email !== 'undefined') {
            return this.#email;
        }
        return (async () => {
            await this.loadUserData();
            return this.#email;
        })();
    }

    get hashedPassword() {
        if (typeof this.#hashedPassword !== 'undefined') {
            return this.#hashedPassword;
        }
        return (async () => {
            await this.loadUserData();
            return this.#hashedPassword;
        })();
    }

    get emailVerified() {
        if (typeof this.#emailVerified !== 'undefined') {
            return this.#emailVerified;
        }
        return (async () => {
            await this.loadUserData();
            return this.#emailVerified;
        })();
    }

    get websites() {
        if (typeof this.#websites !== 'undefined') {
            return this.#websites;
        }
        return (async () => {
            await this.loadUserData();
            return this.#websites;
        })();
    }

    get isAdmin() {
        if (typeof this.#isAdmin !== 'undefined') {
            return this.#isAdmin;
        }
        return (async () => {
            await this.loadUserData();
            return this.#isAdmin;
        })();
    }
}

module.exports = User;