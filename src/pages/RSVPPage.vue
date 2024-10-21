<template>
	<div class="flex" v-if="tokenValidated">
		<!-- Section 1: Welcome -->
		<div id="welcome" class="full-width text-center section-special">
			<vue-flip v-model="welcomeFlipped" class="welcome-img-div">
				<template v-slot:front>
					<div style="display: flex; justify-content: center;">
						<q-img src="/invite-front.png" class="welcome-img" />
					</div>
				</template>
				<template v-slot:back>
					<div v-if="welcomeFlipped" style="display: flex; flex-direction: column">
						<div class="flex flex-center">
							<q-img src="/invite-back.jpg" class="welcome-img" />
						</div>
						<div class=" welcome-text">{{ date }}</div>
						<div class=" welcome-text">@ {{ time }}</div>
					</div>
				</template>
			</vue-flip>
			<div>
				<q-btn color="primary" label="RSVP" @click="scrollToSection('rsvp')" class="text-h6 q-mt-md q-px-lg" />
			</div>
		</div>

		<!-- Section 2: RSVP Form -->
		<div id="rsvp" class="full-width q-pa-md section">
			<q-card v-if="!rsvpSubmitted" class="rsvp-card q-pa-lg">
				<q-card-section class="text-center">
					<div class="welcome-text">We can't wait to see you!</div>
				</q-card-section>

				<q-form @submit.prevent="onRSVPSubmit" class="q-gutter-md">
					<q-input filled v-model="name" label="Your Full Name"
						:rules="[val => !!val || 'Name is required']" />

					<q-input filled v-model="email" label="Your Email" type="email" :rules="[
						val => !!val || 'Email is required',
						val => /.+@.+\..+/.test(val) || 'Please enter a valid email'
					]" />
					<q-input filled v-model="guests" label="Number of Guests" type="number"
						:rules="[val => val > 0 || 'At least one guest is required']" />

					<div class="flex justify-center q-mt-lg">
						<q-btn type="submit" color="primary" label="Submit RSVP" class="full-width text-h6" />
					</div>
				</q-form>
			</q-card>
			<q-card v-else class="rsvp-card q-pa-lg">
				<h6 style="margin-top: 0px;">Thanks {{ name }},</h6>
				<div class="text-body1">We have been updated that you want to come, and will
					send a email to {{ email }} with location and other information shortly.</div>
				<div class="full-width text-center">
					<q-btn color="primary" label="Might Bring A Gift?" @click="scrollToSection('gifts')"
						class="text-h6 q-mt-md q-px-lg" />
				</div>
				<div class="full-width text-center">
					<q-btn label="Edit RSVP" color="black" class="q-mt-md" @click="() => rsvpSubmitted = false" />
				</div>
			</q-card>
		</div>

		<!-- Section 3: Gift List -->
		<div id="gifts" class="full-width q-pa-md section">
			<h2 class="cool-heart-text">If you want to bring a gift!</h2>
			<q-banner v-if="!rsvpSubmitted" class="bg-warning text-white q-mb-md">
				Please submit your RSVP before selecting a gift.
			</q-banner>
			<template v-else>
				<div v-for="section in groupedGiftItems" :key="section.name" class="q-mb-lg">
					<q-card class="gift-card q-pa-lg">
						<div class="text-h5 q-mb-sm">{{ capitalizeFirstLetter(section.name) }}</div>
						<div class="row q-gutter-sm">
							<q-btn v-for="item in section.items" :key="item.name" :label="item.name"
								:disable="item.status === 'claimed'" :color="getItemColor(item)"
								:class="{ 'text-grey': item.status === 'claimed' }" @click="selectGift(item)" rounded
								outline no-caps />
						</div>
					</q-card>
				</div>
				<q-card class="q-pa-md" v-if="selectedGifts.length">
					<div class="text-h6 full-width text-center">
						Selected Gifts
					</div>
					<div class="text-center">
						<q-badge v-for="gift in selectedGifts" :key="gift.name" class="q-pa-sm text-h6 q-ma-sm"
							color="black" :label="gift.name" />
					</div>
				</q-card>

				<q-btn id="select-gift-btn" label="Submit Gift Selection" color="primary" class="q-mt-md text-h6"
					@click="onGiftSubmit" :disable="!rsvpSubmitted || selectedGifts.length === 0" />
			</template>
		</div>
		<div class="extra-space"></div>
	</div>
</template>

<script>
import { mapState } from 'pinia';
import { QSpinnerClock } from 'quasar';
import dataService from 'src/services/data.service';
import { useAuthState } from 'src/stores/auth.state';
import { VueFlip } from 'vue-flip';
import { useRoute } from 'vue-router';

export default {
	name: 'WeddingRSVP',
	components: {
		'vue-flip': VueFlip
	},
	data() {
		return {
			date: '',
			time: '',
			name: '',
			email: '',
			guests: 1,
			rsvpSubmitted: false,
			selectedGifts: [],
			giftItems: [],
			welcomeFlipped: false,
			tokenValidated: false,
			route: useRoute()
		}
	},
	computed: {
		...mapState(useAuthState, ['user']),
		groupedGiftItems() {
			const grouped = this.giftItems.reduce((acc, item) => {
				if (!acc[item.section]) {
					acc[item.section] = { name: item.section, items: [] };
				}
				acc[item.section].items.push(item);
				return acc;
			}, {});
			return Object.values(grouped);
		}
	},
	methods: {
		capitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		scrollToSection(sectionId) {
			const element = document.getElementById(sectionId)
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' })
			}
		},
		async onRSVPSubmit() {
			this.$q.loading.show({
				backgroundColor: "#1e5499",
				message: this.$t("Sending RSVP..."),
			});
			const guest = await dataService.getGuest(this.email);

			const data = {
				name: this.name,
				email: this.email,
				guests: this.guests,
				forceUpdate: false
			}
			if (!guest) {
				console.log("RSVP Made");
				await dataService.rsvp(data);
				localStorage.setItem('rsvp-info', JSON.stringify({ name: this.name, email: this.email, guests: this.guests }))
				this.rsvpSubmitted = true;
				await this.loadGifts();
				this.$q.loading.hide();
			} else {
				this.$q.loading.hide();
				this.$q.dialog({
					title: 'Email RSVP Already Exists',
					message: 'Would you like to update it?',
					cancel: true,
				}).onOk(async () => {
					this.$q.loading.show({
						backgroundColor: "#1e5499",
						message: this.$t("Sending RSVP..."),
					});
					data.forceUpdate = true;
					await dataService.rsvp(data);
					localStorage.setItem('rsvp-info', JSON.stringify({ name: this.name, email: this.email, guests: this.guests }));
					await this.loadGifts();
					this.$q.loading.hide();
					this.rsvpSubmitted = true;
				}).onCancel(async () => {
					localStorage.setItem('rsvp-info', JSON.stringify({ name: this.name, email: this.email, guests: this.guests }));
					await this.loadGifts();
				})
			}
		},
		async loadGifts() {
			this.selectedGifts = [];
			this.giftItems = await dataService.getGifts(this.email);
			for (let gift of this.giftItems.filter(x => x.selected)) {
				gift.status = "needed";
				this.selectedGifts.push(gift);
			}
		},
		selectGift(item) {
			if (!this.rsvpSubmitted) {
				this.$q.notify({
					color: 'negative',
					message: 'Please submit your RSVP before selecting a gift.'
				});
				return;
			}
			if (item.status === 'needed') {
				const isSelected = this.selectedGifts.find(gift => gift.name === item.name && gift.section === item.section);

				// If the gift is already selected, remove it
				if (isSelected) {
					this.selectedGifts = this.selectedGifts.filter(gift => gift.name !== item.name || gift.section !== item.section);
				} else {
					// If not selected and less than 5 gifts, add it
					if (this.selectedGifts.length < 5) {
						this.selectedGifts.push(item);
					} else {
						this.$q.notify({
							color: 'negative',
							message: 'You can select up to 5 gifts.'
						});
					}
				}
			}
		},
		getItemColor(item) {
			const isSelected = this.selectedGifts.find(gift => gift.name === item.name && gift.section === item.section);
			if (!isSelected && item.status === 'claimed') return 'grey-4';
			return isSelected ? 'black' : 'primary';
		},
		async onGiftSubmit() {
			if (!this.rsvpSubmitted) {
				this.$q.notify({
					color: 'negative',
					message: 'Please submit your RSVP before selecting a gift.'
				});
				return;
			}

			if (this.selectedGifts.length === 0) {
				this.$q.notify({
					color: 'negative',
					message: 'Please select at least one gift before submitting.'
				});
				return;
			}

			console.log('Selected gifts:', this.selectedGifts);

			// Submit the selected gifts
			await dataService.submitGifts({
				email: this.email,
				gifts: this.selectedGifts.map(gift => ({
					section: gift.section,
					name: gift.name
				}))
			});

			this.scrollToSection('welcome');

			setTimeout(() => {
				this.$q.dialog({
					title: 'Thank You!',
					message: `Your gift selections have been recorded. We appreciate your generosity! Please close this window.`,
					persistent: true
				}).onDismiss(() => {
					this.$router.push("/thanks");
				});
			}, 1000);
		}
	},
	async mounted() {
		this.$q.loading.show({
			backgroundColor: "white",
			message: this.$t("Validating Token..."),
			spinner: QSpinnerClock,
			messageColor: 'black',
			spinnerColor: 'black'
		});

		const token = this.route?.query?.token;
		try {
			let rsvpPageData = null;
			if (token) {
				localStorage.setItem('guest-token', `Bearer ${token}`);
				rsvpPageData = await dataService.getRSVPPageData();
			} else if (this.user) {
				rsvpPageData = await dataService.getRSVPPageData();
			} else {
				this.$q.dialog({
					title: "Error",
					message: "You have no authorization",
				}).onDismiss(() => {
					this.$router.push('/');
				})
				throw new Error('No Auth');
			}

			if (rsvpPageData) {
				this.date = rsvpPageData.date.toUpperCase();
				this.time = rsvpPageData.time.toUpperCase();
			}
		} catch (err) {
			this.$q.loading.hide();
			this.$q.notify({
				color: 'negative',
				message: 'You are not authorized.'
			});

			return;
		}

		this.tokenValidated = true;

		setTimeout(() => {
			this.welcomeFlipped = true;
		}, 5000);
		try {
			const rsvpInfo = JSON.parse(localStorage.getItem('rsvp-info'));
			this.name = rsvpInfo.name;
			this.email = rsvpInfo.email;
			this.guests = rsvpInfo.guests;
			this.rsvpSubmitted = true;
			console.log("Getting gifts");

			await this.loadGifts();
		} catch (err) { }

		this.$q.loading.hide();

		setTimeout(() => {
			this.$confetti.start({
				defaultType: 'rect',
				defaultSize: '10',
				defaultColors: ['DodgerBlue', 'SlateBlue', 'lightblue', 'SteelBlue']
			})
			setTimeout(() => {
				this.$confetti.stop()
			}, 3000);
		}, 1000)
	}
}
</script>

<style scoped>
.gift-card {
	width: 90vw;
}

.welcome-img-div {
	width: 100%;
	height: 550px;
	padding: 5px;
}

.welcome-img {
	width: 360px;
	height: 466px;
	border: 1px solid #000000;
	/* Light gold border */
	border-radius: 15px;
	/* Rounded corners */
	box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
	/* Soft shadow */
}


@media (min-width: 800px) {
	.welcome-img-div {
		width: 100%;
		height: 600px;
	}

	.gift-card {
		width: 60vw;
	}

	.rsvp-card {
		width: 600px;
	}

	.welcome-text {
		font-size: 40px !important;
	}

	.cool-heart-text {
		font-size: 48px !important;
	}

	.cool-heart-text:before {
		font-size: 40px !important;
	}

	.cool-heart-text:after {
		font-size: 40px !important;
	}
}

.section {
	min-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
	padding-top: env(safe-area-inset-top);
	padding-bottom: env(safe-area-inset-bottom);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.section-special {
	min-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
	padding-top: env(safe-area-inset-top);
	padding-bottom: env(safe-area-inset-bottom);
	display: flex;
	flex-direction: column;
	justify-content: start;
	align-items: center;
}

.cool-heart-text {
	font-size: 20px;
	font-weight: bold;
	color: #0288d1;
	text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
	background: linear-gradient(90deg, #2b0be0, #0b9ce0);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	position: relative;
	display: inline-block;
}

.cool-heart-text:before,
.cool-heart-text:after {
	content: '❤';
	font-size: 20px;
	position: absolute;
	top: -10px;
	background: linear-gradient(90deg, #2b0be0, #0b9ce0);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.cool-heart-text:before {
	left: -45px;
	animation: heart-bounce 1.2s infinite ease-in-out;
}

.cool-heart-text:after {
	right: -40px;
	animation: heart-bounce 1.2s infinite ease-in-out;
	animation-delay: 0.6s;
}

@keyframes heart-bounce {

	0%,
	100% {
		transform: scale(1);
	}

	50% {
		transform: scale(1.3);
	}
}


.welcome-text {
	font-size: 20px;
	font-weight: bold;
	background: linear-gradient(90deg, #2b0be0, #0b9ce0, #0b9ce0);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	color: #0288d1;
	/* A solid color fallback */
	text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
	/* Darker shadow for contrast */
	border-radius: 10px;
	position: relative;
	display: inline-block;
	text-align: center
}
</style>
