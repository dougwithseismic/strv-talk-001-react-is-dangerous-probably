import redditUsernames from '@/dummy/reddit-usernames'
import fs from 'fs'

const generateRandomString = (): string =>
    Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('')

interface NewUser {
    id: string
    username: string
    email: string
    name: string
    password: string
    createdAt: Date
    updatedAt: Date
}

const newUser = ({
    username,
    email,
    name,
}: Omit<NewUser, 'id' | 'password' | 'createdAt' | 'updatedAt'>): NewUser => {
    return {
        id: generateRandomString(),
        password: generateRandomString(),
        username,
        email,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
}

const generateUserCredentials = async () => {
    if (!fs.existsSync('credentials.json')) {
        fs.writeFileSync('credentials.json', JSON.stringify([]))
    }

    const credentialMap = redditUsernames.map((username) => {
        return newUser({
            username,
            email: `${username}@420.com`,
            name: username,
        })
    })

    fs.writeFileSync('credentials.json', JSON.stringify(credentialMap))
}
