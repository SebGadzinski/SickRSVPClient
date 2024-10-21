import VueConfetti from "vue-confetti";
import { boot } from "quasar/wrappers";

export default boot(({ app }) => {
	app.use(VueConfetti);
});
