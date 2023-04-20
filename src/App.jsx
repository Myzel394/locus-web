import "./index.css"
import {createSignal, Show, createResource, onMount} from "solid-js"
import ControlCenter from "./components/ControlCenter"
import MapProvider from "./components/MapProvider"
import fetchKeyFromLink from "./utils/fetch-key-from-link"

function App() {
	const [credentials, setCredentials] = createSignal(null)
	const [field, setField] = createSignal(null)

	onMount(async () => {
		const fragment = new URL(document.location).hash.slice(1)

		// Check if url has a fragment
		if (fragment) {
			const fetchedCredentials = await fetchKeyFromLink(fragment)

			window.location.replace("#")

			// slice off the remaining '#' in HTML5:
			if (typeof window.history.replaceState == "function") {
				history.replaceState({}, "", window.location.href.slice(0, -1))
			}
			setCredentials(fetchedCredentials)
		}
	})

	return (
		<MapProvider>
			<Show
				when={credentials()}
				fallback={
					<form
						onSubmit={event => {
							event.preventDefault()

							const reader = new FileReader()
							reader.onload = event => {
								const credentials = JSON.parse(event.target.result)
								setCredentials(credentials)
							}
							reader.readAsText(field())
						}}
					>
						<input type="file" onChange={event => setField(event.target.files[0])} />
						<button type="submit">Submit</button>
					</form>
				}
			>
				<ControlCenter
					signPublicKey={credentials().signPublicKey}
					viewPrivateKey={credentials().viewPrivateKey}
					nostrPublicKey={credentials().nostrPublicKey}
					nostrRelays={credentials().relays}
				/>
			</Show>
		</MapProvider>
	)
}

export default App
