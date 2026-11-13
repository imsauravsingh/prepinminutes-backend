/**
 * PrepInMinutes — Data Engineering & Lakehouse Roles
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import { RoleSeed } from "./types";

export const DATA_ROLES: RoleSeed[] = [
  {
    slug: "analytics-engineer",
    name: "Analytics & Modern Data Stack Engineer",
    careerBand: "MID_LEVEL",
    track: "data",
    description:
      "Data transformation and modeling engineer specialized in dimensional modeling (Kimball), dbt pipelines, cloud data warehouses (Snowflake, BigQuery), data testing, and metric layers.",
    minProficiency: "L3",
    minExperienceYears: 2,
    maxExperienceYears: 5,
    companyEquivalents: {
      google: "L4 Data Analyst / Analytics Engineer",
      amazon: "L5 Business Intelligence / Data Engineer",
      meta: "E4 Analytics Engineer",
      stripe: "L2 Data Engineer",
      snowflake: "Analytics Solutions Engineer",
    },
    requiredTopics: [
      { topicSlug: "data-sql-advanced-query-optimization", isCore: true, priorityScore: 98, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "data-kimball-dimensional-modeling-scd", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "data-dbt-medallion-transformations", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "data-cloud-warehouses-snowflake-bigquery", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "data-contracts-schema-quality-testing", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "data-airflow-schedulers-idempotent-dags", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "data-columnar-storage-parquet-orc-avro", isCore: true, priorityScore: 91, targetLevel: "L3", minimumDifficulty: "BEGINNER" },
      { topicSlug: "lead-ownership-unblocking-dependencies", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
    ],
  },
  {
    slug: "data-platform-engineer",
    name: "Big Data & Lakehouse Platform Engineer",
    careerBand: "SENIOR",
    track: "data",
    description:
      "Senior distributed data systems engineer driving petabyte-scale lakehouses (Apache Iceberg, Delta Lake), Spark engine tuning, metastore scalability, and data governance.",
    minProficiency: "L4",
    minExperienceYears: 4,
    maxExperienceYears: 8,
    companyEquivalents: {
      google: "L5 Data Platform Engineer",
      amazon: "L6 Senior Data Platform Engineer",
      meta: "E5 Data Systems Engineer",
      databricks: "L5 Systems / Solutions Architect",
      netflix: "Senior Data Platform Engineer",
    },
    requiredTopics: [
      { topicSlug: "data-lakehouse-apache-iceberg", isCore: true, priorityScore: 98, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "data-lakehouse-delta-lake-hudi", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "data-spark-core-dag-shuffle", isCore: true, priorityScore: 98, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "data-spark-optimization-skew-memory", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "data-columnar-storage-parquet-orc-avro", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "BEGINNER" },
      { topicSlug: "data-products-data-mesh-architecture", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "data-lineage-catalogs-compliance-gdpr", isCore: true, priorityScore: 90, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "data-sql-advanced-query-optimization", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-technical-disagreements-disagree-commit", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
    ],
  },
  {
    slug: "streaming-data-engineer",
    name: "Real-Time Streaming Systems Engineer",
    careerBand: "SENIOR",
    track: "data",
    description:
      "Senior real-time systems specialist designing distributed event backbones with Apache Kafka, stateful stream processing via Apache Flink, exactly-once processing, and low-latency feature stores.",
    minProficiency: "L4",
    minExperienceYears: 4,
    maxExperienceYears: 8,
    companyEquivalents: {
      google: "L5 Real-Time Streaming SDE",
      amazon: "L6 Streaming & Event SDE",
      meta: "E5 Real-Time Pipelines",
      linkedin: "Senior Streaming Infrastructure Engineer",
      uber: "L5b Real-Time Platform",
    },
    requiredTopics: [
      { topicSlug: "data-kafka-storage-commit-log", isCore: true, priorityScore: 99, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "data-kafka-consumer-groups-rebalance", isCore: true, priorityScore: 98, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "data-kafka-eos-schema-registry", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "data-flink-state-rocksdb-checkpoints", isCore: true, priorityScore: 98, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "data-flink-event-time-watermarks", isCore: true, priorityScore: 97, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "data-spark-structured-streaming", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-outages-warrooms-postmortems", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
    ],
  },
];
