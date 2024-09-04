<template>
  <div class="user-card">
    <h3>{{ user.username }}</h3>
    <p><strong>Current Role:</strong> {{ user.role }}</p>
    <!-- Dropdown to select user role -->
    <select v-model="selectedRole" @change="handleRoleChange">
      <option v-for="role in roles" :key="role" :value="role">
        {{ role }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import type { UserRole } from '@/models/Roles'
import { defineComponent, type PropType, ref, watch } from 'vue'

interface User {
  _id: string
  username: string
  role: UserRole
}

export default defineComponent({
  name: 'UserCard',
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    roles: {
      type: Array as PropType<UserRole[]>, // Define the prop type
      required: true
    }
  },
  emits: ['update-role'],
  setup(props, { emit }) {
    const selectedRole = ref(props.user.role)

    const handleRoleChange = () => {
      emit('update-role', props.user._id, selectedRole.value)
    }

    watch(
      () => props.user.role,
      (newRole) => {
        selectedRole.value = newRole
      }
    )

    return {
      selectedRole,
      handleRoleChange
    }
  }
})
</script>

<style scoped>
.user-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  text-align: center;
  width: 200px;
}

select {
  margin-top: 10px;
  padding: 5px;
  font-size: 16px;
}
</style>
