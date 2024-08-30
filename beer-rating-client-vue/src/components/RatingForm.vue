<template>
    <form @submit.prevent="handleSubmit" class="rating-form">
        <div class="form-group">
            <label for="score">Score: {{ form.score }}</label>
            <!-- Slider for rating score -->
            <input type="range" id="score" v-model="form.score" min="0" max="5" step="0.25" required />
        </div>
        <div class="form-group">
            <label for="comment">Comment</label>
            <textarea id="comment" v-model="form.comment" required></textarea>
        </div>
        <button type="submit" class="submit-button">{{ isEdit ? 'Update Rating' : 'Add Rating' }}</button>
        <button type="button" @click="cancel" class="cancel-button">Cancel</button>
    </form>
    <div v-if="error">
        <ErrorComponent :errorMessage="error" @retry="handleSubmit" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType, watch, toRefs } from 'vue'
import ErrorComponent from '@/components/ErrorComponent.vue'
import { Myconsts } from '@/const';

export default defineComponent({
    name: 'RatingForm',
    props: {
        rating: {
            type: Object as PropType<{ score: number; comment: string; _id?: string }>,
            default: () => ({ score: 0, comment: '' }),
        },
        isEdit: {
            type: Boolean,
            default: false,
        },
        beerId: {
            type: String,
            required: true,
        },
    },
    components: {
        ErrorComponent
    },
    emits: ['submit', 'cancel'],
    setup(props, { emit }) {
        const error = ref<string | null>(null)
        const { rating, isEdit } = toRefs(props)
        const form = ref({ ...rating.value })

        watch(isEdit, (newVal) => {
            if (newVal) {
                form.value = { ...rating.value }
            } else {
                form.value = { score: 0, comment: '' }
            }
        }, { immediate: true }) // Use immediate to ensure initial form value

        const handleSubmit = async () => {
            error.value = null
            try {
                const token = localStorage.getItem(Myconsts.tokenName)
                if (!token) {
                    throw new Error('User is not authenticated')
                }

                let response
                if (isEdit.value && form.value._id) {
                    // Update existing rating
                    response = await fetch(`/api/ratings/${form.value._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ score: form.value.score, comment: form.value.comment }),
                    })
                } else {
                    // Add new rating
                    response = await fetch(`/api/ratings`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ beerId: props.beerId, score: form.value.score, comment: form.value.comment }),
                    })
                }

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || 'Failed to submit rating')
                }

                const data = await response.json()
                emit('submit', data)
            } catch (err) {
                console.error('Failed to submit rating:', err)
                error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
            }
        }

        const cancel = () => {
            emit('cancel')
        }

        return {
            form,
            handleSubmit,
            cancel,
            error
        }
    }
})
</script>
<style scoped>
.rating-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

input[type="range"] {
    width: 100%;
    margin-top: 5px;
}

.submit-button,
.cancel-button {
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.submit-button:hover,
.cancel-button:hover {
    background-color: #2980b9;
}
</style>