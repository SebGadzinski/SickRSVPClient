<template>
	<router-view />
</template>

<script>
import { defineComponent, ref } from "vue";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import DataService from "./services/data.service";
import Notify from "./services/pushNotifications";
import { useSettingsState } from "./stores/settings.state";

import { mapActions, mapState } from "pinia";
import { useAuthState } from "./stores/auth.state";

export default defineComponent({
	name: "App",
	data() {
		return {
			appState: {
				viewOrientation: ref(""),
			},
		};
	},
	computed: {
		...mapState(useSettingsState, ["notificationsEnabled", "debug", "language",]),
		...mapState(useAuthState, ["user"]),
	},
	async onBeforeUnmount() {
		window.removeEventListener("resize", this.OrientationCheck);
	},
	async mounted() {
		if (this.language) {
			import(
				/* webpackInclude: /(fr|en-US)\.js$/ */
				`quasar/lang/${this.language}`
			).then((lang) => {
				this.$q.lang.set(lang.default);
			});
			this.$i18n.locale = this.language;
		}
		this.initializeDarkMode();
		window.addEventListener("resize", this.OrientationCheck);
		this.OrientationCheck();
		let that = this;
		window.onerror = function (message, source, lineno, colno, error) {
			console.log("ERROS");
			console.log(message);
			console.log(error);

			if (error) {
				alert("Exception: ", error);
			}

			if (process.env.NODE_ENV === "production") {
				that.$gtag.exception({
					description: message,
					fatal: false,
				});
			}

			that.addToEventLog(message);
			if (
				that.debug &&
				that.user?.email == "sebastiangadzinskiwork@gmail.com"
			) {
				that.$q.dialog({
					title: "window onError",
					message: message,
				});
			}
		};
		window.addEventListener("unhandledrejection", function (event) {
			console.log("App.vue Unhandled Error Event");
			console.log(event?.reason?.stack);
			console.log(event);
			if (process.env.NODE_ENV === "production") {
				that.$gtag.exception({
					description: event?.reason?.stack,
					fatal: false,
				});
			}

			// that.addToEventLog(event?.reason?.message);
			if (
				that.debug &&
				that.user?.email == "sebastiangadzinskiwork@gmail.com"
			) {
				let msg = event?.reason?.message + "\n\n";
				try {
					msg += JSON.stringify(event);
				} catch (e) { }
				that.$q.dialog({
					title: "unhandledRejection",
					message: msg,
				});
			}
		});

		if (Capacitor.getPlatform() != "web") {
			await CapacitorUpdater.notifyAppReady();
			if (this.notificationsEnabled) {
				console.log("ADDING NOTIFICATION LISTENERS ON RESTART");
				await Notify.addListeners(this.$router);
			} else {
				await Notify.unregister();
			}
		}
	},
	provide() {
		return {
			appState: this.appState,
		};
	},
	methods: {
		...mapActions(useSettingsState, [
			"addToEventLog",
			"initializeDarkMode",
		]),
		async checkForUpdate() {
			try {
				DataService.checkForUpdate().then((response) => {
					if (!response || !response.message)
						return console.error(
							"Update Check with No response.message"
						);
					switch (response.message) {
						case "No Update Available":
							break;
						case "Update Available":
							if (!response.data.url || !response.data.newVersion)
								return console.error(
									"No reponse.url or response.newVersion"
								);
							let version = "";
							App.addListener("appStateChange", async (state) => {
								if (state.isActive) {
									version = await CapacitorUpdater.download({
										url: response.data.url,
									});
								}
								if (!state.isActive && version !== "") {
									// Do the switch when user leave app
									SplashScreen.show();
									try {
										await CapacitorUpdater.set(version);
									} catch (err) {
										SplashScreen.hide(); // in case the set fail, otherwise the new app will have to hide it
									}
								}
							});

							break;
						default:
							break;
					}
				});
			} catch (err) {
				console.error(`Update Attempt Error ${err}`);
			}
		},
		OrientationCheck() {
			if (window.matchMedia("(orientation: portrait)").matches) {
				this.appState.viewOrientation = "portrait";
			}
			if (window.matchMedia("(orientation: landscape)").matches) {
				this.appState.viewOrientation = "landscape";
			}
		},
	},
});
</script>
