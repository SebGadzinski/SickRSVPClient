<template>
	<q-layout>
		<q-header v-if="user?.roles?.includes('admin')" :class="`my-header ` +
		{
			'header-transparent': hasScrolled,
		}
			" @mouseenter="hoverState = true" @mouseleave="hoverState = false">
			<q-toolbar>
				<q-toolbar-title>
					<router-link to="/">
						<img src="logo.svg" alt="Logo" class="q-mr-md logo-image" />
					</router-link>
				</q-toolbar-title>

				<!-- Menu button shown only on small screens -->
				<q-btn icon="menu" @click="toggleMenu" v-if="$q.screen.lt.md">
					<!-- Menu content -->
					<q-menu fit>
						<q-list>
							<template v-if="user">
								<template v-if="user?.roles?.includes('admin')">
									<q-item to="/rsvp">
										<q-item-section>{{
											$t("RSVP")
										}}</q-item-section></q-item>
									<q-item to="/admin/users">
										<q-item-section>{{
											$t("Users")
										}}</q-item-section></q-item>
									<q-item to="/admin/guests">
										<q-item-section>{{
											$t("Guests")
										}}</q-item-section></q-item>
									<q-item to="/admin/gifts">
										<q-item-section>{{
											$t("Gifts")
										}}</q-item-section></q-item>
								</template>
							</template>
							<template v-else>
								<q-item to="/auth">
									<q-item-section>{{
										$t("Login")
									}}</q-item-section></q-item>
							</template>

							<q-item to="/settings"><q-item-section>{{
								$t("Settings")
							}}</q-item-section></q-item>
						</q-list>
					</q-menu>
				</q-btn>

				<!-- Buttons shown on larger screens -->
				<div v-if="$q.screen.gt.sm">
					<template v-if="user?.roles?.includes('admin')">
						<q-btn flat icon="mail" :label="$t('RSVP')" to="/rsvp"></q-btn>
						<q-btn flat icon="person_search" :label="$t('Users')" to="/admin/users"></q-btn>
						<q-btn flat icon="groups" :label="$t('Guests')" to="/admin/guests"></q-btn>
						<q-btn flat icon="redeem" :label="$t('Gifts')" to="/admin/gifts"></q-btn>
					</template>
					<template v-if="!user">
						<q-btn flat icon="login" :label="$t('Login')" to="/auth"></q-btn>
					</template>
					<q-btn flat icon="settings" to="/settings"></q-btn>
				</div>
			</q-toolbar>
		</q-header>

		<q-page-container class="q-mx-sm" style="padding-top: 0px;">
			<div v-if="user?.roles?.includes('admin')" style="height: 45px;"></div>
			<router-view :key="$route.fullPath" />
		</q-page-container>
	</q-layout>
</template>

<script>
import { mapState } from "pinia";
import { useAuthState } from "src/stores/auth.state";

export default {
	data() {
		return {
			authState: useAuthState(),
			scrollOpacity: 1,
			hasScrolled: false,
			menuOpened: false,
		};
	},
	mounted() {
		window.addEventListener("scroll", this.onScroll);
	},
	beforeUnmount() {
		window.removeEventListener("scroll", this.onScroll);
	},
	computed: {
		...mapState(useAuthState, ["user"]),
	},
	methods: {
		onScroll() {
			const currentScrollPosition =
				window.scrollY || document.documentElement.scrollTop;

			let headers = document.getElementsByClassName("my-header");
			if (headers.length > 0) {
				if (currentScrollPosition < this.lastScrollPosition) {
					// Scrolling up
					if (
						currentScrollPosition < 30 ||
						currentScrollPosition <
						this.lastScrollDownPosition - 100
					) {
						headers[0].classList.remove(`fast`);
						headers[0].classList.remove(`header-transparent`);
						this.isScrollingUp = true;
					}
				} else {
					// Scrolling down
					if (window.scrollY > 400) {
						if (window.scrollY > 800) {
							headers[0].classList.add(`fast`);
						}
						headers[0].classList.add(`header-transparent`);
					}

					this.isScrollingUp = false;
					this.lastScrollDownPosition = currentScrollPosition;
				}
			}

			// Update lastScrollPosition
			this.lastScrollPosition = currentScrollPosition;
		},
		toggleMenu() {
			this.menuOpened = !this.menuOpened;
		},
	},
};
</script>
<style scoped>
.my-header {
	top: 0;
	padding: 5px;
	position: fixed;
	backdrop-filter: blur(10px);
}

.header-transparent {
	background: var(--q-color-accent) !important;
	transition: background-color 2s;
	box-shadow: none;
}

.fast.header-transparent {
	transition: background-color 0.2s !important;
}

.header-transparent:hover {
	background: var(--q-color-primary) !important;
}

.q-toolbar__links {
	display: flex;
	align-items: center;
}

.q-page-container {
	padding-top: 50px;
}

.logo-image {
	width: 2.5rem;
	height: 2.5rem;
}

/* Style for desktop */
@media (min-width: 800px) {
	.my-header {
		top: 0;
		left: 10%;
		right: 10%;
		padding: 5px;
		margin-top: 10px;
		position: fixed;
		backdrop-filter: blur(10px);
	}

	.menu-button {
		display: none;
	}
}
</style>
