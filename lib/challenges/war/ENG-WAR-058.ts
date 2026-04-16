import type { Challenge } from '../types';

// ─── ENG-WAR-058 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-058',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Istio mTLS Breaks Service After Policy Change',
            companies: ['Google', 'Lyft'],
              timeEst: '~25 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `Lyft (one of Istio's creators at the time) documented incidents where changing mTLS policy from PERMISSIVE to STRICT caused services to stop communicating. In PERMISSIVE mode, both plain HTTP and mTLS are accepted. In STRICT mode, only mTLS connections are allowed. A legacy service without Envoy sidecar injected cannot initiate mTLS, so all its outbound calls to STRICT services fail with "connection refused" or TLS handshake errors.`,
                      desc: `Your security team changed the Istio PeerAuthentication policy from PERMISSIVE to STRICT across all namespaces to enforce mTLS. Within minutes, your legacy batch job service (which doesn't have Envoy sidecar injection enabled — it has sidecar.istio.io/inject: "false") started failing all outbound HTTP calls to other microservices with: TLS handshake error from remote address. The batch job is stuck.`,
                        solution: `The legacy service cannot initiate mTLS connections (no Envoy sidecar to handle the TLS). Short-term: apply a namespace-level DestinationRule with tls.mode: DISABLE for the specific host the legacy service calls, allowing plain text connections from that service. Medium-term: enable sidecar injection on the legacy service (or migrate to a mesh-compatible client). Do not revert the global STRICT policy — it protects all other services.`,
                          explanation: `Istio mTLS modes: PERMISSIVE: accepts both mTLS and plain HTTP (good for migration). STRICT: requires mTLS for all inbound connections (enforces zero-trust). A service without Envoy sidecar cannot participate in mTLS. The fix is NOT to revert to PERMISSIVE globally — this weakens security for all services. Instead: create a DestinationRule for the specific service-to-service communication path that needs an exception: DestinationRule: trafficPolicy: tls: mode: DISABLE. This allows the legacy service to communicate while all other services remain protected by STRICT mTLS.`,
                            options: [
                              { label: 'A', title: 'Revert PeerAuthentication to PERMISSIVE globally to restore all connectivity', sub: 'kubectl apply PeerAuthentication: mtls: mode: PERMISSIVE across all namespaces', isCorrect: false },
                              { label: 'B', title: 'Apply DestinationRule with tls: DISABLE for the legacy service path; plan sidecar migration', sub: 'DestinationRule: trafficPolicy.tls.mode: DISABLE for legacy→service path', isCorrect: true },
                              { label: 'C', title: 'Delete the legacy batch job pod and redeploy with sidecar injection enabled', sub: 'kubectl delete pod batch-job-xxx; label namespace for auto-injection', isCorrect: false },
                              { label: 'D', title: 'Expose the target service externally via LoadBalancer and have the legacy service call it via external IP', sub: 'Service type: LoadBalancer; legacy calls external URL instead of cluster-internal', isCorrect: false },
                            ]
  };

export default challenge;
