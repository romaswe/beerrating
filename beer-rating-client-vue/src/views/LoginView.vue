<template>
    <div class="login-container">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" v-model="username" required />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" v-model="password" required />
            </div>
            <button type="submit">Login</button>
        </form>
        <!-- Use ErrorComponent if there is an error -->
        <ErrorComponent v-if="error" :errorMessage="error" :showRetry="false" @retry="handleLogin" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

export default defineComponent({
    name: 'LoginView',
    components: {
        ErrorComponent
    },
    setup() {
        const username = ref('')
        const password = ref('')
        const error = ref<string | null>(null)

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
                if (!response.ok) {
                    throw new Error('Failed to login')
                }
                const data = await response.json()

                // Save token and role to localStorage
                localStorage.setItem('token', data.token)
                localStorage.setItem('role', data.role)

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

        return {
            username,
            password,
            error,
            handleLogin
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