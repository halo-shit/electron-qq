<template>
	<Room
		class="vac-card-window"
		:current-user-id="0"
		:rooms="[room]"
		:messages="messages"
		height="100vh"
		:rooms-loaded="true"
		:messages-loaded="true"
		:show-audio="false"
		:show-reaction-emojis="false"
		:show-new-messages-divider="false"
		:load-first-room="true"
		accepted-files="image/*"
		:message-actions="[]"
		:styles="styles"
		:single-room="true"
		:room-id="0"
		:show-footer="false"
		:show-header="false"
		:show-rooms-list="false"
		:is-mobile="false"
		:menu-actions="[]"
		:show-send-icon="true"
		:show-files="true"
		:show-emojis="true"
		:loading-rooms="false"
		:text-formatting="true"
		:style="[cssVars]"
		@download-image="downloadImage"
		@open-file="openImage"
		@open-forward="openForward"
	/>
</template>

<script>
import {cssThemeVars, defaultThemeStyles} from "../components/vac-mod/themes";
import Room from "../components/vac-mod/ChatWindow/Room/Room";
import {ipcRenderer, remote} from "electron";

let mainWindowId;

export default {
	name: "HistoryView",
	data() {
		return {
			room: {
				roomId: 0,
				roomName: "Forwarded Messages",
				users: [
					{_id: 3, username: "3"},
					{_id: 31, username: "3"},
					{_id: 32, username: "3"},
				],
			},
			messages: [],
			styles: {
				container: {
					boxShadow: "none",
				},
			},
		};
	},
	created() {
		ipcRenderer.on("loadMessages", (event, args, id) => {
			console.log(args);
			this.messages = [...args];
			mainWindowId = id;
		});
		document.addEventListener("keydown", (e) => {
			if (e.repeat) return;
			if (e.key === "w" && e.ctrlKey === true) {
				remote.getCurrentWindow().destroy();
			}
		});
	},
	components: {
		Room,
	},
	computed: {
		cssVars() {
			const defaultStyles = defaultThemeStyles["light"];
			const customStyles = {};

			Object.keys(defaultStyles).map((key) => {
				customStyles[key] = {
					...defaultStyles[key],
					...(this.styles[key] || {}),
				};
			});

			return cssThemeVars(customStyles);
		},
	},
	methods: {
		openForward(resId) {
			remote.BrowserWindow.fromId(mainWindowId).webContents.send(
				"openForward",
				resId
			);
		},
		openImage(resId) {
			console.log(resId)
			remote.BrowserWindow.fromId(mainWindowId).webContents.send(
				"openImage",
				resId
			);
		},
		downloadImage(resId) {
			console.log(resId)
			remote.BrowserWindow.fromId(mainWindowId).webContents.send(
				"downloadImage",
				resId
			);
		},
	},
};
</script>

<style scoped>
::v-deep .vac-col-messages {
	height: 100vh;
}
</style>

<style lang="scss">
@import "../components/vac-mod/styles/index.scss";

.vac-card-window {
	display: block;
	background: var(--chat-content-bg-color);
	color: var(--chat-color);
	overflow-wrap: break-word;
	position: relative;
	white-space: normal;
	border: var(--chat-container-border);
	border-radius: var(--chat-container-border-radius);
	box-shadow: var(--chat-container-box-shadow);
	-webkit-tap-highlight-color: transparent;

	* {
		font-family: inherit;
	}

	a {
		color: #0d579c;
		font-weight: 500;
	}

	.vac-chat-container {
		height: 100%;
		display: flex;

		input {
			min-width: 10px;
		}

		textarea,
		input[type="text"],
		input[type="search"] {
			-webkit-appearance: none;
		}
	}
}
</style>
