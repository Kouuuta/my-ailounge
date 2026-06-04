# Diagrams Index

This folder contains architectural diagrams, process flows, and schema definitions for the MindYou project.


| Filename                                                                       | What it shows                                                                                                                              | Who it's for                             | Last Updated |
| :----------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------- | :----------- |
| [auth_sequence.md](./auth_sequence.md)                                         | Sequence diagram for Authentication and Access flow between Browser, NextJS, Django, and Third Party services.                             | Developers, Security Architects          | 2026-06-03   |
| [enrollment.md](./enrollment.md)                                               | Flowchart for user enrollment and onboarding process (Method A vs B, Email/ID upload, activation, and screening).                          | Product Managers, Operations, Developers | 2026-06-03   |
| [hotleads.md](./hotleads.md)                                                   | High-level system architecture and data flow for "Hot Leads", including AWS infrastructure, security layers, and third-party integrations. | Stakeholders, Non-technical users        | 2026-06-03   |
| [phq9_schema.dbml](./phq9_schema.dbml)                                         | DBML schema definition for the PHQ9 survey system, including questions, answers, and history tracking.                                     | Backend Developers, DBAs                 | 2026-06-03   |
| [ranks.png](./ranks.png)                                                       | Visual representation of user ranks or hierarchy within the system.                                                                        | Designers, Product Managers              | 2026-06-03   |
| [System Architecture mermaid chart.md](./System Architecture mermaid chart.md) | Comprehensive cloud-native infrastructure diagram (AWS VPC, Multi-AZ, Data Layer) and detailed component breakdown.                        | DevOps, System Architects                | 2026-06-03   |

## Purpose

The diagrams in this directory are intended to provide both high-level and granular visibility into the system's architecture, helping with onboarding, security audits, and feature planning.

## Tools Used

- **Mermaid.js**: For most sequence and flow diagrams.
- **DBML**: For database schema modeling.
- **PNG/Images**: For static visual assets.
