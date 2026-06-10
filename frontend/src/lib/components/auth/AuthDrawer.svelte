<script lang="ts">
  import { fly, fade } from 'svelte/transition'
  import { authDrawerStore, closeAuthDrawer, setAuthTab } from '$lib/stores/auth-drawer.store'
  import { login } from '$lib/stores/auth.store'
  import { apiLogin, apiRegister } from '$lib/api/auth'
  import { addToast } from '$lib/stores/toast.store'
  import { ApiError } from '$lib/api/client'

  // Login form state
  let loginEmail = ''
  let loginPassword = ''
  let loginError = ''
  let loginLoading = false

  // Register form state
  let regName = ''
  let regEmail = ''
  let regPassword = ''
  let regConfirm = ''
  let regError = ''
  let regLoading = false

  function resetForms() {
    loginEmail = ''; loginPassword = ''; loginError = ''; loginLoading = false
    regName = ''; regEmail = ''; regPassword = ''; regConfirm = ''; regError = ''; regLoading = false
  }

  function handleOverlayClick() {
    resetForms()
    closeAuthDrawer()
  }

  function switchTab(tab: 'login' | 'register') {
    loginError = ''
    regError = ''
    setAuthTab(tab)
  }

  async function handleLogin() {
    loginError = ''
    loginLoading = true
    try {
      const { token, user } = await apiLogin({ email: loginEmail, password: loginPassword })
      login(token, user)
      addToast(`Welcome back, ${user.name}!`, 'success')
      resetForms()
      closeAuthDrawer()
    } catch (err) {
      loginError = err instanceof ApiError ? err.message : 'Login failed'
    } finally {
      loginLoading = false
    }
  }

  async function handleRegister() {
    regError = ''
    if (regPassword !== regConfirm) {
      regError = 'Passwords do not match'
      return
    }
    regLoading = true
    try {
      await apiRegister({ name: regName, email: regEmail, password: regPassword })
      const { token, user } = await apiLogin({ email: regEmail, password: regPassword })
      login(token, user)
      addToast(`Welcome, ${user.name}!`, 'success')
      resetForms()
      closeAuthDrawer()
    } catch (err) {
      regError = err instanceof ApiError ? err.message : 'Registration failed'
    } finally {
      regLoading = false
    }
  }
</script>

{#if $authDrawerStore.open}
  <!-- Overlay — identical to CartDrawer: rgba(10,10,10,0.5), z-2000, 300ms -->
  <div
    class="fixed inset-0 z-[2000]"
    style="background-color: rgba(10,10,10,0.5);"
    transition:fade={{ duration: 300 }}
    on:click={handleOverlayClick}
    role="presentation"
  ></div>

  <!-- Drawer — identical to CartDrawer: right-0, max-w-450px, 300ms fly, z-2001 -->
  <aside
    class="fixed top-0 right-0 bottom-0 w-full max-w-[450px] bg-white z-[2001] flex flex-col shadow-veln-lg"
    transition:fly={{ x: 450, duration: 300 }}
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-8 py-8"
      style="border-bottom: 1px solid rgba(10,10,10,0.08);"
    >
      <h2 class="font-heading text-[1.5rem] font-[600]">Account</h2>
      <button
        class="p-2 text-[#0A0A0A] transition-opacity duration-fast hover:opacity-60 cursor-pointer"
        on:click={handleOverlayClick}
        aria-label="Close"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Tabs -->
    <div
      class="flex"
      style="border-bottom: 1px solid rgba(10,10,10,0.08);"
    >
      <button
        class="flex-1 py-4 text-[0.875rem] font-[500] tracking-normal transition-all duration-fast cursor-pointer"
        style:border-bottom={$authDrawerStore.tab === 'login' ? '2px solid #0A0A0A' : '2px solid transparent'}
        style:opacity={$authDrawerStore.tab === 'login' ? '1' : '0.45'}
        on:click={() => switchTab('login')}
      >
        Sign in
      </button>
      <button
        class="flex-1 py-4 text-[0.875rem] font-[500] tracking-normal transition-all duration-fast cursor-pointer"
        style:border-bottom={$authDrawerStore.tab === 'register' ? '2px solid #0A0A0A' : '2px solid transparent'}
        style:opacity={$authDrawerStore.tab === 'register' ? '1' : '0.45'}
        on:click={() => switchTab('register')}
      >
        Create account
      </button>
    </div>

    <!-- Body — scrollable -->
    <div class="flex-1 overflow-y-auto px-8 py-8">

      {#if $authDrawerStore.tab === 'login'}
        <!-- Login form -->
        <form on:submit|preventDefault={handleLogin} class="flex flex-col gap-5">
          {#if loginError}
            <p class="text-[0.8125rem] text-[#E63323]">{loginError}</p>
          {/if}

          <div class="flex flex-col gap-1.5">
            <label for="drawer-login-email" class="text-[0.8125rem] font-[500]">Email</label>
            <input
              id="drawer-login-email"
              type="email"
              bind:value={loginEmail}
              required
              class="border border-[rgba(10,10,10,0.2)] px-3 py-2.5 text-[0.9375rem] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-fast"
              placeholder="you@example.com"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="drawer-login-password" class="text-[0.8125rem] font-[500]">Password</label>
            <input
              id="drawer-login-password"
              type="password"
              bind:value={loginPassword}
              required
              class="border border-[rgba(10,10,10,0.2)] px-3 py-2.5 text-[0.9375rem] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-fast"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            class="btn-primary btn-full mt-2"
          >
            {loginLoading ? 'Signing in…' : 'Sign in'}
          </button>

          <p class="text-[0.8125rem] text-[#6B6B6B] text-center">
            No account?
            <button
              type="button"
              class="underline text-[#0A0A0A] cursor-pointer"
              on:click={() => switchTab('register')}
            >Create one</button>
          </p>
        </form>

      {:else}
        <!-- Register form -->
        <form on:submit|preventDefault={handleRegister} class="flex flex-col gap-5">
          {#if regError}
            <p class="text-[0.8125rem] text-[#E63323]">{regError}</p>
          {/if}

          <div class="flex flex-col gap-1.5">
            <label for="drawer-reg-name" class="text-[0.8125rem] font-[500]">Full name</label>
            <input
              id="drawer-reg-name"
              type="text"
              bind:value={regName}
              required
              minlength="2"
              class="border border-[rgba(10,10,10,0.2)] px-3 py-2.5 text-[0.9375rem] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-fast"
              placeholder="Your name"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="drawer-reg-email" class="text-[0.8125rem] font-[500]">Email</label>
            <input
              id="drawer-reg-email"
              type="email"
              bind:value={regEmail}
              required
              class="border border-[rgba(10,10,10,0.2)] px-3 py-2.5 text-[0.9375rem] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-fast"
              placeholder="you@example.com"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="drawer-reg-password" class="text-[0.8125rem] font-[500]">Password</label>
            <input
              id="drawer-reg-password"
              type="password"
              bind:value={regPassword}
              required
              minlength="8"
              class="border border-[rgba(10,10,10,0.2)] px-3 py-2.5 text-[0.9375rem] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-fast"
              placeholder="At least 8 characters"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="drawer-reg-confirm" class="text-[0.8125rem] font-[500]">Confirm password</label>
            <input
              id="drawer-reg-confirm"
              type="password"
              bind:value={regConfirm}
              required
              class="border border-[rgba(10,10,10,0.2)] px-3 py-2.5 text-[0.9375rem] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-fast"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={regLoading}
            class="btn-primary btn-full mt-2"
          >
            {regLoading ? 'Creating account…' : 'Create account'}
          </button>

          <p class="text-[0.8125rem] text-[#6B6B6B] text-center">
            Already have an account?
            <button
              type="button"
              class="underline text-[#0A0A0A] cursor-pointer"
              on:click={() => switchTab('login')}
            >Sign in</button>
          </p>
        </form>
      {/if}

    </div>
  </aside>
{/if}
