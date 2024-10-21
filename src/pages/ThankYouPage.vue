<template>
	<q-page class="flex full-width justify-center items-center">
		<div class="text-center">
			<h1 class="text-h2 text-weight-bold q-mb-md">Thank You, {{ name }}!</h1>
			<p class="text-h5 q-mb-lg">We're thrilled you're joining us!</p>
			<q-card class="q-pa-md" style="	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
; backdrop-filter: blur(10px);">
				<q-card-section>
					<p class="text-h6">An email will be sent to:</p>
					<p class="text-h6 text-weight-bold" :class="{ 'pulse': isPulsing }">{{ email }}</p>
				</q-card-section>
			</q-card>
		</div>
	</q-page>
</template>

<script>

export default {
	name: "ThankYouPage",
	data() {
		return {
			name: '',
			email: '',
			isPulsing: false
		};
	},
	mounted() {
		try {
			const rsvpInfo = JSON.parse(localStorage.getItem('rsvp-info'));
			this.name = rsvpInfo.name;
			this.email = rsvpInfo.email;
			this.startPulsing()
		} catch (err) {
		}
	}
};
</script>

<style scoped>
.q-page {
	min-height: 100%;
}

.pulse {
	animation: pulse 1s infinite;
}


@keyframes pulse {
	0% {
		transform: scale(1);
	}

	50% {
		transform: scale(1.05);
	}

	100% {
		transform: scale(1);
	}
}
</style>
