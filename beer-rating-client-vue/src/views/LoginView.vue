<template>
    <div class="login-container">
        <form v-if="currentForm.toLowerCase() === 'register'" @submit.prevent="handleRegister">
            <h2>Register</h2>
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" v-model="username" required />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" v-model="password" required />
            </div>
            <button type="submit">Register</button>
            <p class="message">Already registered?
                <a href="#" @click.prevent="toggleForm()">Login</a>
            </p>
        </form>
        <form v-else @submit.prevent="handleLogin">
            <h2>Login</h2>

            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" v-model="username" required />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" v-model="password" required />
            </div>
            <button type="submit">Login</button>
            <p class="message">Not registered?
                <a href="#" @click.prevent="toggleForm()">Create an account</a>
            </p>
        </form>
        <!-- Use ErrorComponent if there is an error -->
        <ErrorComponent v-if="error" :errorMessage="error" :showRetry="false" @retry="handleLogin" />
    </div>

</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
import { Myconsts } from '@/const';

export default defineComponent({
    name: 'LoginView',
    components: {
        ErrorComponent
    },
    setup() {
        const username = ref('')
        const password = ref('')
        const error = ref<string | null>(null)
        const currentForm = ref('login')

        const handleLogin = async () => {
            error.value = null // Reset error before attempting login
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'
                const url = `${backendUrl}/api/auth/login`
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username.value, password: password.value })
                })
                const data = await response.json()

                if (!response.ok) {
                    const errorMessage = data.message ?? 'Failed to login'
                    throw new Error(errorMessage)
                }

                // Save token and role to localStorage
                localStorage.setItem(Myconsts.tokenName, data.token)
                localStorage.setItem(Myconsts.roleName, data.role)

                // Refresh the page after successful login
                window.location.reload() // Refresh the page to update the navbar

            } catch (err: unknown) {
                if (err instanceof Error) {
                    error.value = err.message // Handle error as a string
                } else {
                    error.value = 'An unknown error occurred.'
                }
            }
        }

        const handleRegister = async () => {
            error.value = null // Reset error before attempting login
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'
                const url = `${backendUrl}/api/auth/register`
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username.value, password: password.value })
                })
                const data = await response.json()

                if (!response.ok) {
                    const errorMessage = data.message ?? 'Failed to login'
                    throw new Error(errorMessage)
                }

                // Save token and role to localStorage
                localStorage.setItem(Myconsts.tokenName, data.token)
                localStorage.setItem(Myconsts.roleName, data.role)

                // Refresh the page after successful login
                window.location.reload() // Refresh the page to update the navbar

            } catch (err: unknown) {
                if (err instanceof Error) {
                    error.value = err.message // Handle error as a string
                } else {
                    error.value = 'An unknown error occurred.'
                }
            }
        }

        const toggleForm = () => {
            currentForm.value = currentForm.value === 'login' ? 'register' : 'login';
        }

        return {
            username,
            password,
            error,
            handleLogin,
            toggleForm,
            currentForm,
            handleRegister
        }
    }
})
</script>

<style scoped>
.login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
}

.form-group {
    margin-bottom: 15px;
    text-align: left;
}

label {
    display: block;
    margin-bottom: 5px;
}

input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #2980b9;
}

.error-message {
    color: red;
    margin-top: 10px;
}
</style>