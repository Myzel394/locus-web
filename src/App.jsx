import "./index.css"
import {createSignal, Show} from "solid-js"
import ControlCenter from "./ControlCenter"
import MapProvider from "./MapProvider"

function App() {
	const [credentials, setCredentials] = createSignal(null)
	const [field, setField] = createSignal(null)

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
					pgpSignPublicKey={credentials().signPublicKey}
					pgpViewPrivateKey={credentials().viewPrivateKey}
					nostrPublicKey={credentials().nostrPublicKey}
					nostrRelays={["wss://relay.damus.io"]}
				/>
			</Show>
		</MapProvider>
	)
}

export default App
