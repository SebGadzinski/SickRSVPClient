<template>
	<q-page padding class="">

		<!-- Button div that shows up when at least one guest is selected -->
		<div class="q-mt-md flex flex-center">
			<template v-if="selectedGifts.length > 0">
				<q-btn color="negative" @click="() => deleteGifts()" :label="$t('Delete Gifts')" />
			</template>
			<q-btn class="q-mx-sm" color="primary" @click="createGift" :label="$t('Create')" />
		</div>

		<div class="q-px-lg q-pt-md">
			<q-input :dense="$q.screen.lt.md" v-model="search" placeholder="Search" />
		</div>

		<q-table :grid="$q.screen.lt.md" :rows="gifts" :loading="loading" class="q-mt-lg" :columns="columns"
			row-key="_id" :filter="search" :visible-columns="visibleColumns"
			:pagination="{ rowsPerPage: $q.screen.lt.md ? 7 : 10 }" v-model:selected="selectedGifts"
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
							<q-item clickable v-close-popup @click="() => editGift(props.row)">
								<q-item-section>
									<q-item-label>{{ $t("Edit") }}</q-item-label>
								</q-item-section>
							</q-item>
							<q-item class="bg-negative" clickable v-close-popup
								@click="() => deleteGifts([props.row._id])">
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
							:header-class="props.row.status === 'needed' ? 'bg-secondary text-white q-pl-none' : 'bg-primary text-white q-pl-none'">
							<template v-slot:header>
								<div class="truncate-div">
									<q-checkbox v-model="props.selected" />
									<span class="q-my-auto truncate-name"> {{ `${props.row.section} - ${props.row.name}
										| ${props.row.status.toUpperCase()}` }}</span>
								</div>
							</template>
							<q-list bordered separator>
								<q-item>
									<q-item-section>
										<q-item-label caption>{{ $t("Id") }}</q-item-label>
										<q-item-label>{{ props.row._id }}</q-item-label>
									</q-item-section>
								</q-item>
								<q-item>
									<q-item-section>
										<q-item-label caption>{{ $t("Section") }}</q-item-label>
										<q-item-label>{{ props.row.section }}</q-item-label>
									</q-item-section>
								</q-item>
								<q-item>
									<q-item-section>
										<q-item-label caption>{{ $t("Name") }}</q-item-label>
										<q-item-label>{{ props.row.name }}</q-item-label>
									</q-item-section>
								</q-item>
								<q-item v-if="props.row.user">
									<q-item-section>
										<q-item-label caption>{{ $t("Gifter") }}</q-item-label>
										<q-item-label>{{ props.row.user }}</q-item-label>
									</q-item-section>
								</q-item>
								<div class="flex q-px-sm q-mt-sm">
									<q-btn color="secondary" :label="$t('Edit')" @click="() => editGift(props.row)"
										class="text-color full-width" />
									<q-btn color="negative" :label="$t('Delete')"
										@click="() => deleteGifts([props.row._id])"
										class="text-color full-width q-my-sm" />
								</div>

							</q-list>
						</q-expansion-item>
					</q-card>
				</div>
			</template>

		</q-table>

		<!-- Dialog for creating/editing -->
		<q-dialog v-model="editDialog" persistent class="q-pa-lg">
			<q-card style="min-width: 300px;">
				<q-card-section>
					<div class="text-h6">{{ editForm._id ? $t("Edit Gift") : $t("Create Gift") }}</div>
				</q-card-section>

				<q-card-section>
					<q-input v-model="editForm.section" label="Section" />
					<q-input v-model="editForm.name" label="Name" />
					<q-select v-model="editForm.status" :options="statusOptions" label="Status" />
					<q-select v-if="editForm.status === 'claimed'" v-model="editForm.user" :options="guests"
						label="Guest" />
				</q-card-section>

				<q-card-actions align="right">
					<q-btn flat label="Cancel" color="primary" v-close-popup />
					<q-btn flat label="Save" color="primary" @click="saveGift" />
				</q-card-actions>
			</q-card>
		</q-dialog>

	</q-page>
</template>

<script>
import dataService from "../../services/data.service";
import { QSpinnerClock } from "quasar";
import { ref } from "vue";

export default {
	name: "GiftPage",
	data() {
		return {
			loading: true,
			search: "",
			gifts: [],
			selectedGifts: [],
			guests: [],
			columns: [
				{
					name: "_id",
					align: "left",
					label: this.$t("Id"),
					field: (row) => row._id,
					sortable: true,
				},
				{
					name: "section",
					align: "left",
					label: this.$t("Section"),
					field: (row) => row.section,
					sortable: true,
				},
				{
					name: "name",
					align: "left",
					label: this.$t("Name"),
					field: (row) => row.name,
					sortable: true,
				},
				{
					name: "user",
					align: "left",
					label: this.$t("Gifter"),
					field: (row) => row.user ?? 'N/A',
					sortable: true,
				},
				{
					name: "status",
					align: "left",
					label: this.$t("Status"),
					field: (row) => row.status,
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
				"section",
				"name",
				"user",
				"status",
				"actions",
			]),
			editDialog: false,
			editForm: {
				_id: null,
				section: "",
				name: "",
				user: "",
				status: ""
			},
			statusOptions: ["needed", "claimed"],
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
			this.gifts = await dataService.getGiftPageData();
		} catch (err) {
			console.error(err);
		} finally {
			this.$q.loading.hide();
			this.loading = false;
		}
	},
	unmounted() { },
	methods: {
		async deleteGifts(ids) {
			const listToUse = ids ?? this.selectedGifts;

			if (listToUse.length > 0) {
				this.$q.loading.show({
					spinner: QSpinnerClock,
					backgroundColor: "#1e5499",
					message: this.$t("Deleting Gifts..."),
				});
				await dataService.deleteGifts(listToUse);
				this.$q.loading.hide();
				this.$q.notify({
					color: 'positive',
					message: 'Gifts Deleted.'
				});
				window.location.reload();
			}
		},
		async editGift(gift) {
			this.guests = await dataService.getGuestsWithoutGifts();
			this.editForm = { ...gift };
			this.editDialog = true;
		},
		async createGift() {
			this.guests = await dataService.getGuestsWithoutGifts();
			this.editForm = {
				_id: null,
				section: "",
				name: "",
				user: "",
				status: "needed"
			};
			this.editDialog = true;
		},
		async saveGift() {
			try {
				// Check if we're creating or editing
				this.$q.loading.show({
					spinner: QSpinnerClock,
					backgroundColor: "#1e5499",
					message: this.editForm._id ? this.$t("Saving Gift...") : this.$t("Creating Gift..."),
				});

				if (this.editForm._id) {
					// Update existing gift
					const updatedGift = await dataService.editGift(this.editForm);
					const gift = this.gifts.find((x) => x._id === this.editForm._id);

					Object.assign(gift, updatedGift);
					gift.user = updatedGift.user;
				} else {
					// Create a new gift
					const newGift = await dataService.createGift(this.editForm);
					this.gifts.push(newGift); // Assuming the API returns the newly created gift
				}

				this.$q.notify({
					color: 'positive',
					message: this.editForm._id ? 'Gift Updated.' : 'Gift Created.',
				});
				this.editDialog = false;
				this.$q.loading.hide();
			} catch (err) {
				this.$q.loading.hide();
			}
		},
	},
};
</script>
