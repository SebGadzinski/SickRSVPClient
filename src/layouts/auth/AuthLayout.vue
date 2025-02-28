<template>
	<q-layout class="auth-layout">
		<q-header elevated class="bg-primary text-white">
			<q-toolbar>
				<q-toolbar-title> {{ $t(title) }} </q-toolbar-title>
				<q-space />
				<!-- Conditional rendering of Sign Up/Login link based on title -->
				<!-- <q-btn v-if="title === 'Login'" to="/auth/signUp" color="white" text-color="primary">{{ $t("Sign Up")
					}}</q-btn> -->
				<q-btn v-if="
					title === 'Sign Up' || title === 'Change Password'
				" color="white" text-color="primary" to="/auth/login">{{ $t("Login") }}</q-btn>
			</q-toolbar>
		</q-header>

		<q-page-container>
			<q-page class="flex flex-center column">
				<router-view />

				<!-- Forgot Password Link -->
				<q-btn v-if="title === 'Login'" flat class="q-mt-md"
					@click="this.$router.push('/auth/forgotPassword')">{{ $t("Forgot Password?") }}</q-btn>

				<br />

				<!-- Language Selector -->
				<div>
					<q-item>
						<q-item-section>
							<q-btn-dropdown color="primary" split :label="langText">
								<q-list>
									<q-item clickable v-close-popup @click="onLanguageClick('en-US')">
										<q-item-section>
											<q-item-label>English</q-item-label>
										</q-item-section>
									</q-item>

									<q-item clickable v-close-popup @click="onLanguageClick('fr')">
										<q-item-section>
											<q-item-label>Français</q-item-label>
										</q-item-section>
									</q-item>
								</q-list>
							</q-btn-dropdown>
						</q-item-section>
					</q-item>
				</div>
			</q-page>
		</q-page-container>
	</q-layout>
</template>

<script>
import { mapState } from "pinia";
import { useSettingsState } from "src/stores/settings.state";
import { useAuthState } from "src/stores/auth.state";

export default {
	data() {
		return {
			title: this.$t("Auth"),
			settingsState: useSettingsState(),
		};
	},
	computed: {
		...mapState(useAuthState, ["status"]),
	},
	created() {
		// Set the default language
		let langName = this.language;
		if (!langName)
			(langName = "en-US"),
				console.log("SETTING DEFAULT LANGUAGE TO ENGLISH");
		this.settingsState.setLanguage(langName);
		import(`quasar/lang/${langName}`).then((lang) => {
			this.$q.lang.set(lang.default);
		});
		this.$i18n.locale = langName;
		if (this.title !== "Reset Password" && this.status?.loggedIn) {
			this.$router.push("/");
		}
	},
	watch: {
		$route: {
			immediate: true,
			handler(to) {
				if (to.meta.title) {
					this.title = to.meta.title;
				}
			},
		},
	},
	computed: {
		...mapState(useSettingsState, ["language"]),
		langText: {
			get() {
				switch (this.language) {
					case "en-US":
						return "English";
					case "fr":
						return "Français";
					default:
						return "English";
				}
			},
		},
	},
	methods: {
		onLanguageClick(langName) {
			this.settingsState.setLanguage(langName);
			import(
				`quasar/lang/${langName}`
			).then((lang) => {
				this.$q.lang.set(lang.default);
			});
			this.$i18n.locale = langName;
		},
	},
};
</script>

<style>
.auth-layout .form-class {
	width: 300px;
}

/* Media query for screens smaller than 768px (typically phones) */
@media (max-width: 1000px) {
	.auth-layout .form-class {
		width: 100%;
	}

	.auth-layout .q-field__inner.relative-position.col.self-stretch {
		width: 300px;
	}
}
</style>
