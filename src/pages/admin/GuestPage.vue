<template>
	<q-page padding class="">

		<!-- Button div that shows up when at least one guest is selected -->
		<div v-if="selectedGuests.length > 0" class="q-mt-md flex flex-center">
			<q-btn color="negative" @click="() => deleteGuests()" :label="$t('Delete Guests')" />
			<q-btn class="q-mx-sm" color="primary" @click="() => sendInvitation()" :label="$t('Send Email')" />
		</div>

		<div class="q-px-lg q-pt-md">
			<q-input :dense="$q.screen.lt.md" v-model="search" placeholder="Search" />
		</div>

		<q-table :grid="$q.screen.lt.md" :rows="guests" :loading="loading" class="q-mt-lg" :columns="columns"
			row-key="email" :filter="search" :visible-columns="visibleColumns"
			:pagination="{ rowsPerPage: $q.screen.lt.md ? 7 : 10 }" v-model:selected="selectedGuests"
			selection="multiple">
			<template v-if="$q.screen.gt.sm" v-slot:top>
				<q-space />
				<q-select v-model="visibleColumns" multiple outlined dense options-dense
					:display-value="$q.lang.table.columns" emit-value map-options :options="columns" option-value="name"
					options-cover style="min-width: 150px" />
			</template>

			<template v-slot:body-cell-email="props">
				<q-td :props="props">
					{{ props.row.email }}
				</q-td>
			</template>

			<!-- Update this section to display multiple gifts -->
			<template v-slot:body-cell-gifts="props">
				<q-td :props="props">
					<div v-if="props.row.gifts && props.row.gifts.length > 0">
						<div v-for="gift in props.row.gifts" :key="gift.name">
							{{ gift.section }} - {{ gift.name }}
						</div>
					</div>
					<div class="text-left" v-else>
						<span>{{ $t("No gifts selected") }}</span>
					</div>
				</q-td>
			</template>

			<template v-if="$q.screen.gt.sm" v-slot:body-cell-actions="props">
				<q-td :key="props.name">
					<q-btn-dropdown color="primary">
						<q-list>
							<q-item clickable v-close-popup @click="() => sendInvitation([{ email: props.row.email }])">
								<q-item-section>
									<q-item-label>{{ $t("Send Invitation") }}</q-item-label>
								</q-item-section>
							</q-item>
							<q-item class="bg-negative" clickable v-close-popup
								@click="() => deleteGuests([{ email: props.row.email }])">
								<q-item-section>
									<q-item-label>{{ $t("Delete") }}</q-item-label>
								</q-item-section>
							</q-item>
						</q-list>
					</q-btn-dropdown>
				</q-td>
			</template>

			<template v-if="$q.screen.lt.md" v-slot:item="props">
				<div class="q-pa-xs col-12">
					<q-card flat bordered>
						<q-expansion-item :expand-separator="true" expand-icon="arrow_downward"
							expand-icon-class="text-white"
							:header-class="props.row.emailSent ? 'bg-primary text-white q-pl-none' : 'bg-secondary text-white q-pl-none'">
							<template v-slot:header>
								<div class="truncate-div">
									<q-checkbox v-model="props.selected" />
									<span class="q-my-auto truncate-name"> {{ props.row.email }}</span>
								</div>
							</template>
							<q-list bordered separator>
								<q-item>
									<q-item-section>
										<q-item-label caption>{{ $t("Name") }}</q-item-label>
										<q-item-label>{{ props.row.name }}</q-item-label>
									</q-item-section>
								</q-item>
								<q-item>
									<q-item-section>
										<q-item-label caption>{{ $t("Guests") }}</q-item-label>
										<q-item-label>{{ props.row.guests }}</q-item-label>
									</q-item-section>
								</q-item>
								<!-- Update this section to display multiple gifts in mobile -->
								<q-item>
									<q-item-section>
										<q-item-label caption>{{ $t("Gifts") }}</q-item-label>
										<q-item-label>
											<div v-if="props.row.gifts && props.row.gifts.length > 0">
												<div v-for="gift in props.row.gifts" :key="gift.name">
													{{ gift.section }} - {{ gift.name }}
												</div>
											</div>
											<div v-else>
												<span>{{ $t("No gifts selected") }}</span>
											</div>
										</q-item-label>
									</q-item-section>
								</q-item>
								<q-item>
									<q-item-section>
										<q-item-label caption>{{ $t("Email Sent") }}</q-item-label>
										<q-item-label>{{ props.row.emailSent ? 'YES' : 'NO' }}</q-item-label>
									</q-item-section>
								</q-item>
								<div class="flex q-px-sm q-mt-sm">
									<q-btn color="secondary" :label="$t('Send Email Link')"
										@click="async () => await sendInvitation([{ email: props.row.email }])"
										class="text-color full-width" />
									<q-btn color="negative" :label="$t('Delete')"
										@click="() => deleteGuests([{ email: props.row.email }])"
										class="text-color full-width q-my-sm" />
								</div>
							</q-list>
						</q-expansion-item>
					</q-card>
				</div>
			</template>
		</q-table>
	</q-page>
</template>

<script>
import dataService from "../../services/data.service";
import { QSpinnerClock } from "quasar";
import { useAuthState } from "src/stores/auth.state";
import { ref } from "vue";
import { mapState } from "pinia";

export default {
	name: "GuestsPage",
	data() {
		return {
			loading: true,
			search: "",
			guests: [],
			selectedGuests: [], // Holds the selected guests
			authState: useAuthState(),
			columns: [
				{
					name: "email",
					align: "left",
					label: this.$t("Email"),
					field: (row) => row.email,
					sortable: true,
				},
				{
					name: "name",
					align: "left",
					label: this.$t("Full Name"),
					field: (row) => row.name,
					sortable: true,
				},
				{
					name: "guests",
					align: "center",
					label: this.$t("Guests"),
					field: (row) => row.guests,
					sortable: true,
				},
				{
					name: "gifts",
					align: "left",
					label: this.$t("Gifts"),
					field: (row) => row.gifts,
				},
				{
					name: "emailSent",
					align: "center",
					label: this.$t("Email Sent"),
					field: (row) => row.emailSent,
					sortable: true,
				},
				{
					name: "actions",
					align: "left",
					label: this.$t("Actions"),
					field: "actions",
					field: (row) => row.actions,
				},
			],
			visibleColumns: ref([
				"name",
				"email",
				"guests",
				"gifts",
				"emailSent",
				"actions",
			]),
		};
	},
	async mounted() {
		try {
			this.loading = true;
			this.$q.loading.show({
				spinner: QSpinnerClock,
				backgroundColor: "#1e5499",
				message: this.$t("Getting Info..."),
			});
			this.guests = await dataService.getGuestPageData();
		} catch (err) {
			console.error(err);
		} finally {
			this.$q.loading.hide();
			this.loading = false;
		}
	},
	unmounted() { },
	async updated() { },
	methods: {
		async sendInvitation(emails) {
			let listToUse = [];

			if (emails?.length > 0) {
				listToUse = this.guests.filter((x) => emails.some(y => y.email === x.email));
			} else {
				listToUse = this.selectedGuests;
			}

			if (listToUse.length > 0) {
				const emailList = listToUse.map((guest) => guest.email);
				this.$q.loading.show({
					spinner: QSpinnerClock,
					backgroundColor: "#1e5499",
					message: this.$t("Sending Emails..."),
				});
				await dataService.sendInvitation(emailList); // Send the list of emails
				listToUse.forEach((guest) => {
					guest.emailSent = true;
				});
				this.$q.loading.hide();
				this.$q.notify({
					color: 'positive',
					message: 'Emails Sent.'
				})
			}
		},
		async deleteGuests(emails) {
			const listToUse = emails ?? this.selectedGuests;

			if (listToUse.length > 0) {
				const emailList = listToUse.map((guest) => guest.email);
				this.$q.loading.show({
					spinner: QSpinnerClock,
					backgroundColor: "#1e5499",
					message: this.$t("Sending Emails..."),
				});
				console.log(emailList);

				await dataService.deleteGuests(emailList);
				window.location.reload();
			}
		},
	},
	computed: {
		...mapState(useAuthState, ["user"]),
	},
};
</script>
