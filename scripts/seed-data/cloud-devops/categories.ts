import { CategorySeed } from './types';

export const CLOUD_DEVOPS_CATEGORIES: CategorySeed[] = [
  {
    slug: 'devops-linux-internals',
    name: 'Linux Kernel, Systems & Process Internals',
    description: 'Kernel system calls, namespaces, cgroups v2, process scheduling (CFS), memory virtualization, and system profiling.',
    order: 1,
  },
  {
    slug: 'devops-networking-stack',
    name: 'Systems & Cloud Networking Architecture',
    description: 'TCP/UDP socket lifecycle, congestion control (BBR/CUBIC), netfilter, iptables, eBPF, and DNS resolution pipelines.',
    order: 2,
  },
  {
    slug: 'devops-containers-runtimes',
    name: 'Containerization, OCI Runtimes & Image Security',
    description: 'OCI specs, containerd, runc, OverlayFS union filesystems, multi-stage Docker builds, and non-root runtime hardening.',
    order: 3,
  },
  {
    slug: 'devops-k8s-control-plane',
    name: 'Kubernetes Architecture & Control Plane Internals',
    description: 'API Server reconciliation, etcd Raft consensus, kube-scheduler decision trees, pod lifecycle, QoS classes, and autoscaling.',
    order: 4,
  },
  {
    slug: 'devops-k8s-networking-mesh',
    name: 'Kubernetes Networking, CNI & Service Meshes',
    description: 'ClusterIP, NodePort, LoadBalancer, CNI plugins (Calico, Cilium eBPF), Gateway API, and service meshes (Istio/Envoy mTLS).',
    order: 5,
  },
  {
    slug: 'devops-k8s-storage-operators',
    name: 'Kubernetes Storage, CSI, Operators & CRDs',
    description: 'StatefulSets, PersistentVolumes, StorageClasses, Container Storage Interface (CSI), volume snapshots, and Custom Controllers/CRDs.',
    order: 6,
  },
  {
    slug: 'devops-iac-terraform',
    name: 'Infrastructure as Code & State Management',
    description: 'Terraform and OpenTofu core engines, HCL dependency graphs, remote state locking, drift detection, and Terragrunt modularity.',
    order: 7,
  },
  {
    slug: 'devops-gitops-operations',
    name: 'Declarative GitOps & Cluster Delivery',
    description: 'ArgoCD and Flux v2 declarative reconciliation, ApplicationSets, multi-cluster deployments, sync waves, and automated drift correction.',
    order: 8,
  },
  {
    slug: 'devops-cicd-delivery',
    name: 'CI Pipelines & Progressive Delivery',
    description: 'GitHub Actions workflow parallelization, build caching, Canary and Blue-Green traffic shifting with Argo Rollouts and Flagger.',
    order: 9,
  },
  {
    slug: 'devops-supply-chain-security',
    name: 'Software Supply Chain Security',
    description: 'Software Bill of Materials (SBOM), Cosign container image cryptographic signing, SLSA framework, and admission policies (OPA/Kyverno).',
    order: 10,
  },
  {
    slug: 'devops-observability-telemetry',
    name: 'Observability, Metrics & Distributed Tracing',
    description: 'Prometheus metrics scraping, PromQL aggregations, OpenTelemetry (OTel) spans and context propagation, and structured logging (Loki).',
    order: 11,
  },
  {
    slug: 'devops-sre-incident-ops',
    name: 'SRE Reliability, Error Budgets & Incidents',
    description: 'SLI/SLO/SLA mathematical definitions, multi-window multi-burn-rate alerting, SEV incident commander protocols, and blameless post-mortems.',
    order: 12,
  },
  {
    slug: 'devops-resilience-chaos',
    name: 'Chaos Engineering, Resilience & Disaster Recovery',
    description: 'Proactive fault injection with ChaosMesh/Litmus, Game Days, RPO/RTO calculations, and active-active multi-region failover.',
    order: 13,
  },
  {
    slug: 'devops-cloud-security',
    name: 'Cloud Identity, Secrets & Zero Trust Architecture',
    description: 'Cloud IAM least privilege, RBAC/ABAC, HashiCorp Vault dynamic secrets, Cloud KMS envelope encryption, and Workload Identity Federation.',
    order: 14,
  },
  {
    slug: 'devops-platform-developer-exp',
    name: 'Platform Engineering, IDPs & FinOps Optimization',
    description: 'Internal Developer Platforms (Backstage), Golden Paths, self-service infrastructure, FinOps unit economics, and cloud cost rightsizing.',
    order: 15,
  },
  {
    slug: 'devops-cloud-aws',
    name: 'AWS Enterprise Cloud Architecture',
    description: 'AWS VPC networking, IAM, EKS, RDS Aurora, S3, AWS Organizations, Control Tower, Transit Gateway, and multi-region resilience.',
    order: 16,
  },
  {
    slug: 'devops-cloud-gcp',
    name: 'GCP Enterprise Cloud Architecture',
    description: 'Google Cloud resource hierarchy, IAM, VPC networks, GKE Autopilot, Shared VPC, VPC Service Controls, Cloud Spanner, and Cloud Run.',
    order: 17,
  },
  {
    slug: 'devops-cloud-azure',
    name: 'Azure Enterprise Cloud Architecture',
    description: 'Microsoft Entra ID, Azure VNets, NSGs, AKS architecture, Azure Landing Zones, Hub-Spoke peering, Cosmos DB, and Azure Policy governance.',
    order: 18,
  },
];

