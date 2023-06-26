import "./index.css"
import {createSignal, Show, createResource, onMount, createEffect, JSX} from "solid-js"
import ControlCenter from "./components/ControlCenter"
import MapProvider from "./components/MapProvider"
import fetchKeyFromLink from "./utils/fetch-key-from-link"
import getDecryptionKeyFromNostr, {
	DecryptionCredentials,
} from "./utils/get-decryption-key-from-nostr"
import parseLink from "./utils/parse-link"

function App() {
	const [credentials, setCredentials] = createSignal<DecryptionCredentials | null>(null)
	const [field, setField] = createSignal(null)

	createEffect(async () => {
		const fragment = new URL(document.location.href).hash.slice(1)

		// Check if url has a fragment
		if (fragment) {
			try {
				const linkData = parseLink(fragment)
				const fetchedCredentials = await getDecryptionKeyFromNostr(linkData)

				window.location.replace("#")

				// slice off the remaining '#' in HTML5:
				if (typeof window.history.replaceState == "function") {
					history.replaceState({}, "", window.location.href.slice(0, -1))
				}

				setCredentials(fetchedCredentials)
			} catch (error) {
				console.error(error)

				alert(
					"We are sorry, but the link seems to be invalid. This is most likely due to the Nostr relays not saving the link properly. Please ask the sender to use different relays. There is nothing we can do about this.",
				)
			}
		}
	})

	return (
		<MapProvider>
			<Show<boolean>
				when={credentials() !== null}
				fallback={
					(
						<form
							onSubmit={event => {
								event.preventDefault()

								const reader = new FileReader()
								reader.onload = event => {
									setCredentials(JSON.parse(event.target!.result as string))
								}
								reader.readAsText(field()!)
							}}
						>
							<input
								type="file"
								onChange={event => setField(event.target.files[0])}
							/>
							<button type="submit">Submit</button>
						</form>
					) as JSX.Element
				}
			>
				<ControlCenter
					encryptionPassword={credentials()!.encryptionPassword}
					nostrPublicKey={credentials()!.nostrPublicKey}
					relays={credentials()!.relays}
				/>
			</Show>
		</MapProvider>
	)
}

export default App
