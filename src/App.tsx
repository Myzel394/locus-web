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
