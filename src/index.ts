import { getInput, setFailed } from '@actions/core'
import { spawn, execSync } from 'child_process'

try {
  execSync('sudo apt-get install openfortivpn')
} catch (err) {
  setFailed(err.stderr + '')
  process.exit(1)
}

try {
  const username = getInput('username')
  const password = getInput('password')
  const hostname = getInput('host')
  const trustedCert = getInput('trustedCert')
  const openfortivpn = spawn(
    'sudo',
    ['openfortivpn', hostname, `--username=${username}`, `--trusted-cert=${trustedCert}`],
    {
      detached: true,
    }
  )
  openfortivpn.stdin.write(`${password}\n`)
  openfortivpn.stdout.on('data', (data) => {
    const line = data.toString() as string
    console.log(line)
    if (line.includes('Tunnel is up and running')) {
      process.exit(0)
    } else if (line.includes('Could not authenticate to gateway')) {
      setFailed('Failed to login')
      process.exit(1)
    }
  })
  openfortivpn.on('close', () => {
    setFailed('Client unexpectedly closed')
    process.exit(1)
  })
} catch (error) {}
