## Highlights of My Work

---

### Research Contributions (`/pubs`)

My reserach goes to top-tier conferences and journals in systems, programming languages, and software engineering:

- *Validating JIT Compilers via Compilation Space Exploration* (TOCS '25; CCF-A) [PDF](pdfs/csx_tocs25.pdf) · [Artemis](https://github.com/test-jitcomp/Artemis) · [Apollo](https://github.com/test-jitcomp/Apollo)

- *The Mutators Reloaded: Fuzzing Compilers with Large Language Model Generated Mutation Operators* (ASPLOS '24; CCF-A) [PDF](pdfs/metamut_asplos24.pdf) · [MetaMut](https://github.com/icsnju/MetaMut)

- *Understanding Code Changes Practically with Small-Scale Language Models* (ASE '24; CCF-A) [PDF](pdfs/hqcm_ase24.pdf) · [HQCM](https://github.com/codefuse-ai/codefuse-hqcm)

- 🏆 **[Best Paper Award]** *Validating JIT Compilers via Compilation Space Exploration* (SOSP '23; CCF-A) [PDF](pdfs/artemis_sosp23.pdf) · [Slides](pdfs/artemis_sosp23_slides.pdf) · [Video](https://www.youtube.com/watch?v=eCuDIGktWBU)

- *Push-Button Synthesis of Watch Companions for Android Apps* (ICSE '22; CCF-A) [PDF](pdfs/jigsaw_icse22.pdf) · [Jigsaw](https://zenodo.org/record/5850491) · [Video](https://youtu.be/-7YZ3nfk3XY)

- *Cross-Device Record and Replay for Android Apps* (ESEC/FSE '22; CCF-A) [PDF](pdfs/rx_esecfse22.pdf) · [Rx](https://github.com/connglli/directorx) · [Video](https://youtu.be/xmR-0mwxeKE)

---

### Open-source Contributions (`/oss`)

My research actively contributes to the compiler community.

*Artemis* ([github.com/test-jitcomp/Artemis](https://github.com/test-jitcomp/Artemis)): On the one hand, I'm active around JVMs and received thanks from HotSpot's and OpenJ9's JIT complier teams. My work was also [liked](https://mastodon.social/@mreinhold/111137654333720854) by [Mark Reinhold](https://mreinhold.org), the Chief Architect of the Java Platform Group at Oracle. Specifically, I've found 80+ JIT compiler bugs in four widely-used production JVMs, namely HotSpot, OpenJ9, Graal, and the Android Runtime (ART), where 50+ have been confirmed or fixed. These bugs are diverse ranging from segmentation faults (SIGSEGV), fatal arithmetic error (SIGFPE), emergency abort (SIGABRT), assertion failures, mis-compilations, to performance issues. The following lists some selected JIT compiler bugs that I found:

- HotSpot: [JDK-8287223](https://bugs.openjdk.java.net/browse/JDK-8287223), [JDK-8290781](https://bugs.openjdk.java.net/browse/JDK-8290781), [JDK-8293996](https://bugs.openjdk.java.net/browse/JDK-8293996), [JDK-8289043](https://bugs.openjdk.java.net/browse/JDK-8289043), [JDK-8288975](https://bugs.openjdk.java.net/browse/JDK-8288975)
- OpenJ9: [#15305](https://github.com/eclipse-openj9/openj9/issues/15305), [#15319](https://github.com/eclipse-openj9/openj9/issues/15319), [#15335](https://github.com/eclipse-openj9/openj9/issues/15335), [#15369](https://github.com/eclipse-openj9/openj9/issues/15369), [#15338](https://github.com/eclipse-openj9/openj9/issues/15338)
- ART: [227382489](https://issuetracker.google.com/issues/227382489), [229134124](https://issuetracker.google.com/issues/229134124), [230079540](https://issuetracker.google.com/issues/230079540), [230635320](https://issuetracker.google.com/issues/230635320)
- Graal: [#4754](https://github.com/oracle/graal/issues/4754), [#6350](https://github.com/oracle/graal/issues/6350), [#6351](https://github.com/oracle/graal/issues/6351)


*MetaMut* ([github.com/icsnju/MetaMut](https://github.com/icsnju/MetaMut)): Beyond that, I'm also active in ensuring the correctness of other optimizing compilers like GCC and LLVM. Below are some bugs that my collaborators and I have found:

- GCC: [114206](https://gcc.gnu.org/bugzilla/show_bug.cgi?id=114206), [111811](https://gcc.gnu.org/bugzilla/show_bug.cgi?id=111811)
- LLVM: [#69212](https://github.com/llvm/llvm-project/issues/69212), [#69205](https://github.com/llvm/llvm-project/issues/69205), [#69063](https://github.com/llvm/llvm-project/issues/69063)


*SymLang* ([github.com/connglli/symlang](https://github.com/connglli/symlang)): I'm also working on a symbolic language (or intermediate representation) that feature symbols as a first-class member. It is a CFG-based symbolic intermediate representation designed for program synthesis, based on symbolic execution and constraint generation.

