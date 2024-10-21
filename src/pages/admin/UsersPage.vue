<template>
	<q-page padding class="">
		<!-- Button div that shows up when at least one user is selected -->
		<div v-if="selectedUsers.length > 0" class="q-mt-md flex flex-center">
			<q-btn class="q-mx-sm" color="primary" @click="() => sendRSVPLink()" :label="$t('Send RSVP Link')" />
		</div>

		<div class="q-px-lg q-pt-md">
			<q-input :dense="$q.screen.lt.md" v-model="search" placeholder="Search" />
		</div>

		<q-table :grid="$q.screen.lt.md" :rows="users" :loading="loading" class="q-mt-lg" :columns="columns"
			row-key="email" :filter="search" :visible-columns="visibleColumns"
			:pagination="{ rowsPerPage: $q.screen.lt.md ? 7 : 10 }" v-model:selected="selectedUsers"
			selection="multiple">
			<template v-if="$q.screen.gt.sm" v-slot:top>
				<q-space />

				<q-select v-model="visibleColumns" multiple outlined dense options-dense
					:display-value="$q.lang.table.columns" emit-value map-options :options="columns" option-value="name"
					options-cover style="min-width: 150px" />
			</template>

			<template v-if="$q.screen.gt.sm" v-slot:body-cell-actions="props">
				<q-td :key="props.name">
					<q-btn-dropdown color="primary">
						<q-list>
							<q-item clickable v-close-popup @click="() => sendRSVPLink([{ email: props.row.email }])">
								<q-item-section>
									<q-item-label>{{ $t("Send RSVP Link") }}</q-item-label>
								</q-item-section>
							</q-item>
							<q-item clickable v-close-popup :to="`/profile/${props.row._id}`">
								<q-item-section>
									<q-item-label>{{ $t("Edit Profile") }}</q-item-label>
								</q-item-section>
							</q-item>
							<q-item v-for="(action, index) in props.row.actions" :key="index" :to="action.link"
								clickable v-close-popup>
								<q-item-section>
									<q-item-label>{{ $t(action.name) }}</q-item-label>
								</q-item-section>
							</q-item>
						</q-list>
					</q-btn-dropdown>
				</q-td>
			</template>

			<template v-if="$q.screen.lt.md" v-slot:item="props">
				<div class="q-pa-xs col-12">
					<q-card flat bordered>
						<q-expansion-item :label="props.row.email" :expand-separator="true" expand-icon="arrow_downward"
							expand-icon-class="text-white"
							:header-class="props.row.emailConfirmed ? 'bg-primary text-white q-pl-none' : 'bg-secondary text-white q-pl-none'">
							<template v-slot:header>
								<div class="truncate-div">
									<q-checkbox v-model="props.selected" />
									<span class="q-my-auto truncate-name"> {{ props.row.email }}</span>
								</div>
							</template>
							<q-list bordered separator>
								<q-item>
									<q-item-section>
										<q-item-label caption>{{ $t("ID") }}</q-item-label>
										<q-item-label>{{ props.row._id }}</q-item-label>
									</q-item-section>
								</q-item>
								<q-item>
									<q-item-section>
										<q-item-label caption>{{ $t("Name") }}</q-item-label>
										<q-item-label>{{ props.row.fullName }}</q-item-label>
									</q-item-section>
								</q-item>
								<q-item v-if="props.row?.phoneNumber">
									<q-item-section>
										<q-item-label caption>{{ $t("Phone") }}</q-item-label>
										<q-item-label>{{ props.row.phoneNumber }}</q-item-label>
									</q-item-section>
								</q-item>
								<q-item>
									<q-item-section>
										<q-item-label caption>{{ $t("MFA") }}</q-item-label>
										<q-item-label>{{ props.row.mfa }}</q-item-label>
									</q-item-section>
								</q-item>
								<div class="flex q-px-sm q-mt-sm">
									<q-btn color="secondary" :label="$t('View Profile')"
										:to="`/profile/${props.row._id}`" class="text-color full-width" />
									<q-btn color="secondary" :label="$t('Send RSVP Link')"
										@click="() => sendRSVPLink([{ email: props.row.email }])"
										class="text-color full-width q-my-sm" />
									<q-btn v-for="(action, index) in props.row.actions" :key="index" color="secondary"
										:label="$t(action.name)" :to="action.link"
										class="text-color full-width q-mb-sm" />
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
	name: "UsersPage",
	data() {
		return {
			loading: true,
			search: "",
			users: [],
			selectedUsers: [], // Hold the selected users
			authState: useAuthState(),
			columns: [
				{
					name: "id",
					align: "left",
					label: "Id",
					field: (row) => row._id,
					sortable: true,
				},
				{
					name: "fullName",
					align: "left",
					label: this.$t("Full Name"),
					field: (row) => row.fullName,
					sortable: true,
				},
				{
					name: "email",
					align: "left",
					label: "Email",
					field: (row) => row.email,
					sortable: true,
				},
				{
					name: "emailConfirmed",
					align: "left",
					label: this.$t("Email Confirmed"),
					field: (row) => row.emailConfirmed,
					sortable: true,
				},
				{
					name: "phoneNumber",
					align: "left",
					label: this.$t("Phone Number"),
					field: (row) => row.phoneNumber,
					sortable: true,
				},
				{
					name: "mfa",
					align: "left",
					label: this.$t("MFA"),
					field: (row) => row.mfa,
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
				"id",
				"fullName",
				"email",
				"emailConfirmed",
				"actions",
				"phoneNumber",
				"mfa"
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
			this.users = await dataService.getUserPageData();
		} catch (err) {
			console.error(err);
		} finally {
			this.$q.loading.hide();
			this.loading = false;
		}
	},
	methods: {
		async sendRSVPLink(emails) {
			const listToUse = emails ?? this.selectedUsers;

			if (listToUse.length > 0) {
				const emailList = listToUse.map((guest) => guest.email);
				this.$q.loading.show({
					spinner: QSpinnerClock,
					backgroundColor: "#1e5499",
					message: this.$t("Sending Emails..."),
				});
				await dataService.sendRSVPLink(emailList);
				this.$q.loading.hide();
				this.$q.notify({
					color: 'positive',
					message: 'Emails Sent.'
				})
			}
		},
	},
	computed: {
		...mapState(useAuthState, ["user"]),
	},
};
</script>
