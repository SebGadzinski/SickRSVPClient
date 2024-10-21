const mainLayouts = {
	header: "HeaderLayout",
	drawer: "DrawerLayout",
	tab: "TabLayout",
	sidebar: "SideBarLayout",
};

const layout = {
	path: "/",
	component: () => import(`layouts/main/${mainLayouts.header}.vue`),
	children: [
		{ path: "", redirect: "/close-window" },
		{
			path: "close-window",
			component: () => import("src/pages/CloseWindowPage.vue"),
		},
		{ path: "rsvp", component: () => import("src/pages/RSVPPage.vue") },
		{
			path: "thanks",
			component: () => import("src/pages/ThankYouPage.vue"),
		},
		{
			name: "notification",
			path: "notification/:openedFrom/:notification",
			component: () => import("pages/NotificationPage.vue"),
		},
		{ path: "settings", component: () => import("pages/SettingsPage.vue") },
		{ path: "profile", component: () => import("pages/ProfilePage.vue") },
		{
			path: "profile/:userId",
			component: () => import("pages/ProfilePage.vue"),
		},
		{
			path: "admin/users",
			component: () => import("pages/admin/UsersPage.vue"),
		},
		{
			path: "admin/guests",
			component: () => import("pages/admin/GuestPage.vue"),
		},
		{
			path: "admin/gifts",
			component: () => import("pages/admin/GiftsPage.vue"),
		},
		{
			path: ":catchAll(.*)*",
			component: () => import("pages/Error404.vue"),
		},
	],
};

const routes = [
	layout,
	{
		path: "/auth",
		component: () => import("layouts/auth/AuthLayout.vue"),
		children: [
			{ path: "", redirect: "/auth/login" },
			{
				path: "login",
				component: () => import("pages/auth/LoginPage.vue"),
				meta: { title: "Login" },
			},
			// {
			// 	path: "signUp",
			// 	component: () => import("pages/auth/SignUpPage.vue"),
			// 	meta: { title: "Sign Up" },
			// },
			{
				path: "forgotPassword",
				component: () => import("pages/auth/ForgotPasswordPage.vue"),
				meta: { title: "Change Password" },
			},
			{
				path: "resetPassword",
				component: () => import("pages/auth/ResetPasswordPage.vue"),
				meta: { title: "Reset Password" },
			},
			{
				path: "confirmation",
				component: () => import("pages/auth/EmailConfirmationPage.vue"),
				meta: { title: "Confirm Email" },
			},
			{
				path: "check-confirm/email",
				component: () =>
					import("pages/auth/CheckEmailConfirmationPage.vue"),
				meta: { title: "Confirmation" },
			},
			{
				path: ":catchAll(.*)*",
				component: () => import("pages/Error404.vue"),
			},
		],
	},
	{
		path: "/:catchAll(.*)*",
		component: () => import("pages/Error404.vue"),
	},
];

export default routes;
