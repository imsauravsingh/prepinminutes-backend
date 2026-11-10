import { CategorySeed } from './types';

export const DATA_ENGINEERING_CATEGORIES: CategorySeed[] = [
  {
    slug: 'data-storage-file-formats',
    name: 'Columnar Storage, Serialization & Object Stores',
    description: 'Parquet, ORC, Avro internals, row groups, dictionary encoding, compression codecs, and S3/GCS throughput optimization.',
    order: 1,
  },
  {
    slug: 'data-lakehouse-table-formats',
    name: 'Open Lakehouse Table Formats (Iceberg & Delta Lake)',
    description: 'ACID transactions on object storage, Apache Iceberg metadata trees, partition evolution, Delta Lake transaction logs, and compaction.',
    order: 2,
  },
  {
    slug: 'data-spark-distributed-compute',
    name: 'Apache Spark Engine Architecture & Optimization',
    description: 'Catalyst optimizer, Tungsten whole-stage code generation, shuffle read/write mechanics, join strategies, and data skew mitigation.',
    order: 3,
  },
  {
    slug: 'data-streaming-kafka-distributed-logs',
    name: 'Apache Kafka & Distributed Log Streaming',
    description: 'Append-only commit logs, zero-copy kernel transfer, consumer group rebalance protocols, and Exactly-Once Semantics (EOS).',
    order: 4,
  },
  {
    slug: 'data-stream-processing-flink',
    name: 'Stateful Stream Processing with Apache Flink',
    description: 'Event time processing, watermarks, windowing algorithms, RocksDB state backends, and Chandy-Lamport distributed checkpointing.',
    order: 5,
  },
  {
    slug: 'data-warehousing-dimensional-modeling',
    name: 'Dimensional Modeling & Cloud Data Warehouses',
    description: 'Kimball star/snowflake schemas, Slowly Changing Dimensions (SCDs), Snowflake micro-partitioning, BigQuery Capacitor, and query tuning.',
    order: 6,
  },
  {
    slug: 'data-query-engines-federation',
    name: 'Distributed Query Engines & Federation',
    description: 'Trino/Presto MPP distributed query execution, federated data access, DuckDB vectorized execution, and Apache Arrow in-memory interchange.',
    order: 7,
  },
  {
    slug: 'data-orchestration-transformations',
    name: 'Modern Orchestration, Ingestion & Transformations',
    description: 'Apache Airflow idempotent DAGs, dbt Medallion architecture (Bronze/Silver/Gold), and Change Data Capture (CDC with Debezium).',
    order: 8,
  },
  {
    slug: 'data-contracts-quality-observability',
    name: 'Data Contracts, Quality, Observability & Security',
    description: 'Data contracts, schema validation, data freshness/volume observability (Monte Carlo), OpenLineage, and column/row-level security (RBAC/ABAC).',
    order: 9,
  },
  {
    slug: 'data-lakehouse-architecture-finops',
    name: 'Lakehouse Architecture, Operations, FinOps & Data Products',
    description: 'Lambda vs Kappa vs Lakehouse architectures, Big Data FinOps cost optimization, pipeline disaster recovery, and Data Mesh domain products.',
    order: 10,
  },
  {
    slug: 'data-sql-python-programming',
    name: 'SQL & Data Engineering Programming',
    description: 'Advanced analytical SQL (window functions, CTEs), execution plans, and Python out-of-core file processing with PyArrow and generators.',
    order: 11,
  },
];

