package com.surajupadhye.interviewquestbackend.config;

import com.surajupadhye.interviewquestbackend.entity.Subject;
import com.surajupadhye.interviewquestbackend.entity.SyllabusTopic;
import com.surajupadhye.interviewquestbackend.repository.SubjectRepository;
import com.surajupadhye.interviewquestbackend.repository.SyllabusTopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private SyllabusTopicRepository syllabusTopicRepository;

    @Override
    public void run(String... args) throws Exception {
        if (subjectRepository.count() == 0) {
            seedDatabase();
        }
    }

    private void seedDatabase() {
        // ==========================================================
        // 1. SUBJECT: Operating Systems
        // ==========================================================
        Subject os = Subject.builder()
                .title("Operating Systems")
                .code("OS")
                .slug("operating-systems")
                .description("Learn core architectural concepts including CPU scheduling algorithms, virtual memory, process execution, thread synchronization, and deadlocks.")
                .iconName("Cpu")
                .showOnLandingPage(true)
                .build();
        os = subjectRepository.save(os);

        SyllabusTopic osIntro = SyllabusTopic.builder()
                .subject(os)
                .title("Introduction to OS")
                .slug("introduction-to-os")
                .chapter("Chapter 1: Overview & Introduction")
                .sortOrder(10)
                .content("""
An **Operating System (OS)** acts as an intermediary between a user of a computer and the computer hardware. The purpose of an operating system is to provide an environment in which a user can execute programs in a convenient and efficient manner.

## What Exactly Is an Operating System?

The operating system manages everything behind the scenes, making sure that your favorite applications run smoothly without you even noticing the complex tasks being handled. It sits directly between the application layer and the physical resources of the hardware.

[DIAGRAM: os-arch]

## Core Functions of an OS

The operations of a modern operating system can be divided into key responsibilities:

### Resource Allocation
Manages and allocates hardware resources (CPU time, memory space, I/O registers) to various active programs and user terminals.

### Process Management
Controls process creation, scheduling execution, thread synchronization, inter-process communication, and termination.

### Memory Management
Tracks every byte of primary memory and regulates logical-to-physical translations for active tasks.

### Storage and File System
Organizes data on secondary storage blocks (SSD/HDD) and enforces directory read/write security permissions.

## Types of Operating Systems

Operating systems have evolved over time to fit different hardware architectures:

* **Batch OS:** Executes similar jobs in batches sequentially without direct user interaction.
* **Time-Sharing OS:** Allocates small CPU time slices to multiple active processes simultaneously.
* **Distributed OS:** Connects autonomous computer systems over networks to collaborate on processes.
* **Real-Time OS (RTOS):** Guarantees task execution within strictly defined time constraints (e.g., medical devices, flight controllers).
                    """)
                .build();

        SyllabusTopic osProcess = SyllabusTopic.builder()
                .subject(os)
                .title("Process Management")
                .slug("process-management")
                .chapter("Chapter 2: Process Control")
                .sortOrder(20)
                .content("""
A **Process** is a program in execution. It represents the unit of work in a modern time-sharing operating system.

## Understanding Process States

During its lifecycle, a process transitions through various execution states as scheduled by the operating system:

[DIAGRAM: process-states]

### New
The process is being initialized and loaded into memory from disk.

### Ready
The process is waiting in the ready queue to be assigned to a CPU core.

### Running
Instructions are currently being executed by the CPU.

### Waiting
The process is blocked, waiting for an external event (such as I/O read/write or message signal).

### Terminated
The process has finished execution and its resources are reclaimed by the kernel.

## Process Control Block

Each process is represented in the operating system by a **Process Control Block (PCB)**, which stores scheduling details, register contents, page tables, and file descriptors.
                    """)
                .build();

        SyllabusTopic osSched = SyllabusTopic.builder()
                .subject(os)
                .title("CPU Scheduling")
                .slug("cpu-scheduling")
                .chapter("Chapter 3: CPU Scheduling")
                .sortOrder(30)
                .content("""
**CPU Scheduling** is the basis of multi-programmed operating systems. By switching the CPU among processes, the operating system makes computing more productive.

## Scheduling Criteria

To measure scheduling efficiency, operating systems track:
* **CPU Utilization:** Keep the CPU as busy as possible (target 100%).
* **Throughput:** Number of processes completed per unit of time.
* **Turnaround Time:** Total elapsed time from process submission to completion.
* **Waiting Time:** Total time a process spends waiting in the ready queue.
* **Response Time:** Time from submission until the first response output starts.

## Scheduling Algorithms

Common algorithms used by schedulers include:

### First-Come First-Served
Non-preemptive scheduling where the process that requests the CPU first gets allocated first.

### Shortest Job First
Selects the process with the shortest next CPU burst time. Preemptive version is called Shortest Remaining Time First (SRTF).

### Round Robin
Allocates a fixed time slice (time quantum) to each process in a circular queue. Excellent for interactive responsiveness.
                    """)
                .build();

        SyllabusTopic osSync = SyllabusTopic.builder()
                .subject(os)
                .title("Process Synchronization")
                .slug("process-synchronization")
                .chapter("Chapter 4: Synchronization & Semaphores")
                .sortOrder(40)
                .content("""
Cooperating processes sharing local variables or shared memory segments can experience conflict, leading to **Race Conditions** if access is unregulated.

## The Critical Section Problem

A critical section is a block of code accessing shared resources. A valid solution must satisfy:
1. **Mutual Exclusion:** Only one process can execute in its critical section at a time.
2. **Progress:** If no process is executing and some want to enter, selection cannot be postponed indefinitely.
3. **Bounded Waiting:** A limit exists on the number of requests allowed before a waiting process is granted access.

[DIAGRAM: critical-section]

## Semaphores & Mutexes

* **Mutex:** A simple locking mechanism (binary: lock/unlock) to protect critical sections.
* **Semaphore:** An integer counter accessed via atomic actions `wait()` and `signal()`.
                    """)
                .build();

        SyllabusTopic osDeadlock = SyllabusTopic.builder()
                .subject(os)
                .title("Deadlocks")
                .slug("deadlocks")
                .chapter("Chapter 5: Deadlock Handling")
                .sortOrder(50)
                .content("""
A **Deadlock** is a state where a set of processes are permanently blocked because each process holds a resource and waits for another resource held by another process in the loop.

## Necessary Conditions

A deadlock can only occur if all four conditions hold simultaneously:

### Mutual Exclusion
At least one resource must be held in a non-shareable mode.

### Hold and Wait
A process must hold at least one resource and wait to acquire additional resources held by others.

### No Preemption
Resources cannot be preempted; they can only be released voluntarily by the holding process.

### Circular Wait
A closed chain of processes exists where each process waits for a resource held by the next.

[DIAGRAM: circular-wait]

## Deadlock Handling Strategies

* **Prevention:** Configure resource requests so that at least one necessary condition can never occur.
* **Avoidance:** Dynamically evaluate state safety (e.g., using **Banker's Algorithm**).
* **Detection & Recovery:** Periodically scan for loops, terminating deadlocked tasks if discovered.
                    """)
                .build();

        syllabusTopicRepository.saveAll(List.of(osIntro, osProcess, osSched, osSync, osDeadlock));


        // ==========================================================
        // 2. SUBJECT: Database Management Systems
        // ==========================================================
        Subject dbms = Subject.builder()
                .title("Database Systems")
                .code("DBMS")
                .slug("database-management-systems")
                .description("Understand relational databases, SQL queries, transaction ACID rules, schema normalization, indexing, and storage engine mechanics.")
                .iconName("Database")
                .showOnLandingPage(true)
                .build();
        dbms = subjectRepository.save(dbms);

        SyllabusTopic dbmsIntro = SyllabusTopic.builder()
                .subject(dbms)
                .title("Introduction to DBMS")
                .slug("introduction-to-dbms")
                .chapter("Chapter 1: Relational Database Model")
                .sortOrder(10)
                .content("""
A **Database Management System (DBMS)** is a system software used to store, organize, retrieve, and secure records.

## Why Do We Need a DBMS?

Traditional file systems suffer from structural dependency, search difficulty, and safety hazards. A DBMS introduces:
* **Data Redundancy reduction:** Centralized storage avoids duplicate records.
* **Concurrency Control:** Permits multiple transactions safely.
* **Integrity Constraints:** Restricts entries to valid data formats.

[DIAGRAM: dbms-arch]

## Three-Schema Architecture

The framework supports data independence by defining three abstraction layers:
1. **External Schema:** Customer views and application queries.
2. **Logical Schema:** Table definitions, types, and primary key relations.
3. **Physical Schema:** Secondary memory data blocks, files, and index paths.
                    """)
                .build();

        SyllabusTopic dbmsSql = SyllabusTopic.builder()
                .subject(dbms)
                .title("Relational Model & SQL")
                .slug("relational-model-and-sql")
                .chapter("Chapter 2: SQL Query Operations")
                .sortOrder(20)
                .content("""
The **Relational Model** organizes data records into two-dimensional tables (relations) consisting of rows (tuples) and columns (attributes).

## SQL Database Queries

SQL is a declarative language used to select, modify, and define data sets.

### SQL Join Operations
Combines rows from two or more tables based on a related common key.

[DIAGRAM: sql-joins]

### Sample Join Query
```sql
SELECT orders.order_id, customers.name, orders.amount
FROM orders
INNER JOIN customers ON orders.customer_id = customers.customer_id;
```
                    """)
                .build();

        SyllabusTopic dbmsNorm = SyllabusTopic.builder()
                .subject(dbms)
                .title("Schema Normalization")
                .slug("schema-normalization")
                .chapter("Chapter 3: Normalization Forms")
                .sortOrder(30)
                .content("""
**Normalization** structures relational databases to eliminate redundant records and prevent anomalies during database updates.

## Structural Normal Forms

Data tables are normalized progressively through structural constraints:

[DIAGRAM: normal-forms]

### First Normal Form (1NF)
Attribute domains must contain only atomic (indivisible) values.

### Second Normal Form (2NF)
Satisfies 1NF and removes partial dependencies (no non-prime attribute depends on a subset of a candidate key).

### Third Normal Form (3NF)
Satisfies 2NF and removes transitive dependencies (non-prime attributes must depend only on candidate keys).
                    """)
                .build();

        syllabusTopicRepository.saveAll(List.of(dbmsIntro, dbmsSql, dbmsNorm));


        // ==========================================================
        // 3. SUBJECT: Computer Networks
        // ==========================================================
        Subject cn = Subject.builder()
                .title("Computer Networks")
                .code("CN")
                .slug("computer-networks")
                .description("Analyze the standard network stack, protocol layers, routing operations, subnetting, TCP/IP fundamentals, and connection security.")
                .iconName("Globe")
                .showOnLandingPage(true)
                .build();
        cn = subjectRepository.save(cn);

        SyllabusTopic cnLayers = SyllabusTopic.builder()
                .subject(cn)
                .title("Network Stack & Layers")
                .slug("network-stack-and-layers")
                .chapter("Chapter 1: Reference Layers")
                .sortOrder(10)
                .content("""
A network stack organizes network communications into structured layer groupings.

## Standard Reference Models

## The OSI Model (7 Layers)
The standard reference model mapping network communications:

[DIAGRAM: osi-layers]

1. **Physical Layer:** Transmission of bits over media.
2. **Data Link Layer:** Node-to-node frame delivery.
3. **Network Layer:** IP routing and packet delivery.
4. **Transport Layer:** End-to-end reliability (TCP/UDP).
5. **Session Layer:** Connection control.
6. **Presentation Layer:** Data format translation.
7. **Application Layer:** Interfaces to end-user software.
                    """)
                .build();

        SyllabusTopic cnTcp = SyllabusTopic.builder()
                .subject(cn)
                .title("Transport Layer (TCP/UDP)")
                .slug("transport-layer-tcp-udp")
                .chapter("Chapter 2: Routing & Transport")
                .sortOrder(20)
                .content("""
The Transport Layer manages process-to-process delivery using logical port allocations.

## TCP vs UDP

The two main protocols at the transport layer serve completely different transport paradigms:

### TCP (Transmission Control Protocol)
Provides connection-oriented, reliable, ordered data transport.

[DIAGRAM: tcp-handshake]

### UDP (User Datagram Protocol)
Provides connectionless, fast, lightweight data delivery without sequencing or flow control.
                    """)
                .build();

        syllabusTopicRepository.saveAll(List.of(cnLayers, cnTcp));


        // ==========================================================
        // 4. SUBJECT: OOP Design
        // ==========================================================
        Subject oop = Subject.builder()
                .title("OOP Design")
                .code("OOP")
                .slug("object-oriented-programming")
                .description("Grasp core paradigms including abstraction, inheritance, encapsulation, and polymorphism with structural concepts supporting Java, C++, and Python.")
                .iconName("GitFork")
                .showOnLandingPage(true)
                .build();
        oop = subjectRepository.save(oop);

        SyllabusTopic oopPillars = SyllabusTopic.builder()
                .subject(oop)
                .title("OOP Paradigms Overview")
                .slug("oop-paradigms-overview")
                .chapter("Chapter 1: Core Design Pillars")
                .sortOrder(10)
                .content("""
Object-Oriented Programming (OOP) is a software design methodology based on wrapping variables and functions into modular **Objects**.

## Core Pillars of OOP

[DIAGRAM: oop-pillars]

### Encapsulation
Bundling code and attributes inside a class, hiding direct access via private scopes.

### Inheritance
Creating parent-child hierarchies where children reuse parent class methods and variables.

### Polymorphism
Enabling class methods to execute differently based on the calling object (overloading/overriding).

### Abstraction
Exposing clean interfaces while hiding nested backend operations.
                    """)
                .build();

        syllabusTopicRepository.save(oopPillars);


        // ==========================================================
        // 5. SUBJECT: DSA Theory
        // ==========================================================
        Subject dsa = Subject.builder()
                .title("DSA Theory")
                .code("DSA")
                .slug("data-structures-and-algorithms")
                .description("Examine time and space complexity models, core structures, graph theory, sorting, searching, and algorithmic strategies (conceptual theory only).")
                .iconName("Code")
                .showOnLandingPage(true)
                .build();
        dsa = subjectRepository.save(dsa);

        SyllabusTopic dsaComplexity = SyllabusTopic.builder()
                .subject(dsa)
                .title("Asymptotic Analysis")
                .slug("asymptotic-analysis")
                .chapter("Chapter 1: Performance Scales")
                .sortOrder(10)
                .content("""
**Asymptotic Analysis** evaluates the relative speed and scale performance of algorithms as inputs grow.

## Algorithm Big O Complexities

We evaluate time complexity limits mathematically:

[DIAGRAM: complexity-curves]

### O(1) - Constant Time
Execution time remains identical regardless of input size.

### O(log N) - Logarithmic Time
Execution time halves at each operation step (e.g. Binary Search).

### O(N) - Linear Time
Execution time scales directly with input size.
                    """)
                .build();

        syllabusTopicRepository.save(dsaComplexity);
    }
}
