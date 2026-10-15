# Quiz 6 - ISTQB Foundation Level (Sample Exam)

---

## Question #1 (1 Point) (1.1.1.I001)

Which of the following statements describe a valid test objective?

**Selections:**

- a) To prove that there are no unfixed defects in the system under test
- b) To prove that there will be no failures after the implementation of the system into production
- c) To reduce the risk level of the test object and to build confidence in the quality level
- d) To verify that there are no untested combinations of inputs

**✅ Answer: c)** To reduce the risk level of the test object and to build confidence in the quality level

> c) is correct. Testing finds defects and failures which reduces the level of risk and at the same time gives more confidence in the quality level of the test object. This aligns with the typical objectives of testing defined in the syllabus (section 1.1.1), which include reducing the risk level and building confidence in the quality. Options a), b), and d) are invalid because testing cannot *prove* the absence of defects or failures (see the testing principle "testing shows the presence of defects, not their absence"), and exhaustive testing of all input combinations is impossible (principle of exhaustive testing).

---

## Question #2 (1 Point) (1.2.1.I002)

Which of the following options shows an example of test activities that contribute to success?

**Selections:**

- a) Having testers involved during various software development lifecycle (SDLC) activities will help to detect defects in work products
- b) Testers try not to disturb the developers while coding, so that the developers write better code
- c) Testers collaborating with end users help to improve the quality of defect reports during component integration and system testing
- d) Certified testers will design much better test cases than non-certified testers

**✅ Answer: a)** Having testers involved during various software development lifecycle (SDLC) activities will help to detect defects in work products

> a) is correct. It is important that testers are involved from the beginning of the software development lifecycle (SDLC). It will increase understanding of design decisions and will detect defects early. This reflects the syllabus point that testers participating in work product reviews and other SDLC activities helps detect defects early and improves quality. Options b), c), and d) do not reflect valid contributions: avoiding developers contradicts the whole-team approach, defect report quality is not the main benefit of end-user collaboration, and certification alone does not guarantee better test design.

---

## Question #3 (1 Point) (1.3.1.I003)

You have been assigned as a tester to a team producing a new system incrementally. You have noticed that no changes have been made to the existing regression test cases for several iterations and no new regression defects were identified. Your manager is happy, but you are not. Which testing principle explains your skepticism?

**Selections:**

- a) Tests wear out
- b) Absence-of-errors fallacy
- c) Defects cluster together
- d) Exhaustive testing is impossible

**✅ Answer: a) Tests wear out**

> a) is correct. This principle means that if the same tests are repeated over and over again, eventually these tests no longer find any new defects. This is probably why the tests all passed in this release as well. When the same regression tests are unchanged for several iterations, they lose their effectiveness at finding new defects — the tests need to be reviewed and revised, or new tests written, to remain effective.

---

## Question #4 (1 Point) (1.4.2.I004)

You work in a team that develops a mobile application for food ordering. In the current iteration the team decided to implement the payment functionality.

Which of the following activities is a part of test analysis?

**Selections:**

- a) Estimating that testing the integration with the payment service will take 8 person-days
- b) Deciding that the team should test if it is possible to properly share payment between many users
- c) Using boundary value analysis (BVA) to derive the test data for the test cases that check the correct payment processing for the minimum allowed amount to be paid
- d) Analyzing the discrepancy between the actual result and expected result after executing a test case that checks the process of payment with a credit card, and reporting a defect

**✅ Answer: b) Deciding that the team should test if it is possible to properly share payment between many users**

> b) is correct. This is an example of defining test conditions which is a part of test analysis. Test analysis answers the question "what to test?" — analyzing the test basis to identify testable features and to define and prioritize test conditions. Option a) is test planning (estimation), c) is test design (deriving test data with BVA), and d) is test execution / test monitoring and control (analyzing results and reporting defects).

---

## Question #5 (1 Point) (2.1.1.I005)

Which of the following factors have a SIGNIFICANT influence on the test approach?

- i. The SDLC
- ii. The number of defects detected in previous projects
- iii. The identified product risks
- iv. New regulatory requirements forcing formal white-box testing
- v. The test environment setup

**Selections:**

- a) i, ii have significant influence
- b) i, iii, iv have significant influence
- c) ii, iv, v have significant influence
- d) iii, v have significant influence

**✅ Answer: b) i, iii, iv have significant influence**

> b) is correct.
> - i. Is true. The SDLC has an influence on the test approach
> - ii. Is false. The number of defects detected in previous projects may have some influence, but this is not as significant as i, iii and iv
> - iii. Is true. The identified product risks are one of the most important factors influencing the test approach
> - iv. Is true. Regulatory requirements are important factors influencing the test approach
> - v. Is false. The test environment has no significant influence on the test approach

---

## Question #6 (1 Point) (1.5.1.I006)

Which of the following tasks belong MAINLY to a testing role?

**Selections:**

- a) Configure test environments
- b) Maintain the product backlog
- c) Design solutions to new requirements
- d) Create the test plan

**✅ Answer: a) Configure test environments**

> a) is correct. This is done by the testers. Configuring test environments is part of test implementation, which belongs mainly to the testing role. Option b) is the responsibility of the product owner, c) belongs to developers/designers, and d) creating the test plan belongs mainly to the test management role (test planning, test monitoring and control, test completion).

---

## Question #7 (1 Point) (1.5.2.I007)

Which of the following skills (i-v) are the MOST important skills of a tester?

- i. Having domain knowledge
- ii. Creating a product vision
- iii. Being a good team player
- iv. Planning and organizing the work of the team
- v. Critical thinking

**Selections:**

- a) ii and iv are important
- b) i, iii and v are important
- c) i, ii and v are important
- d) iii and iv are important

**✅ Answer: b) i, iii and v are important**

> b) is correct.
> - i. Is true. Having domain knowledge is an important tester skill
> - ii. Is false. This is a task of the business analyst together with the business representative
> - iii. Is true. Being a good team player is an important skill
> - iv. Is false. Planning and organizing the work of the team is a task of the test manager or, mostly in an Agile software development project, the whole team and not just the tester
> - v. Is true. Critical thinking is one of the most important skills of testers

---

## Question #8 (1 Point) (1.5.3.I008)

How is the whole team approach present in the interactions between testers and business representatives?

**Selections:**

- a) Business representatives decide on test automation approaches
- b) Testers help business representatives to define test strategy
- c) Business representatives are not part of the whole team approach
- d) Testers help business representatives to create suitable acceptance tests

**✅ Answer: d) Testers help business representatives to create suitable acceptance tests**

> d) is correct. Testers will work closely with business representatives to ensure that the desired quality levels are achieved. This includes supporting and collaborating with them to help them create suitable acceptance tests. Option a) is incorrect because test automation approaches are decided by the (test) team, not business representatives; b) is incorrect because the test strategy is defined by the testers/test manager, not the business representatives; and c) is incorrect because in the whole team approach, business representatives ARE part of the team.

---

## Question #9 (1 Point) (2.1.1.I009)

Consider the following rule: "for every SDLC activity there is a corresponding test activity". In which SDLC models does this rule hold?

**Selections:**

- a) Only in sequential SDLC models
- b) Only in iterative SDLC models
- c) Only in iterative and incremental SDLC models
- d) In sequential, incremental, and iterative SDLC models

**✅ Answer: d) In sequential, incremental, and iterative SDLC models**

> d) is correct. This rule holds for all SDLC models. In any software development lifecycle — sequential (e.g., waterfall), incremental, or iterative (e.g., Agile) — every development activity has a corresponding test activity. This is a good testing practice independent of the chosen SDLC model, enabling early testing throughout the lifecycle.

---

## Question #10 (1 Point) (2.1.4.I010)

Which of the following statements BEST describes the acceptance test-driven development (ATDD) approach?

**Selections:**

- a) In ATDD, acceptance criteria are typically created based on the given/when/then format
- b) In ATDD, test cases are mainly created at component testing and are code-oriented
- c) In ATDD, tests are created, based on acceptance criteria to drive the development of the related software
- d) In ATDD, tests are based on the desired behavior of the software, which makes it easier for team members to understand them

**✅ Answer: c) In ATDD, tests are created, based on acceptance criteria to drive the development of the related software**

> c) is correct. In acceptance test-driven development (ATDD) tests are written from acceptance criteria as part of the design process. Option a) describes BDD (the given/when/then format is used in Behavior-Driven Development), b) describes TDD (tests are code-oriented at the component level), and d) also describes BDD (tests based on desired behavior in natural language understandable by stakeholders).

---

## Question #11 (1 Point) (2.1.5.I011)

Which of the following is NOT an example of the shift left approach?

**Selections:**

- a) Reviewing the user requirements before they are formally accepted by the stakeholders
- b) Writing a component test before the corresponding code is written
- c) Executing a performance efficiency test for a component during component testing
- d) Writing a test script before setting up the configuration management process

**✅ Answer: d) Writing a test script before setting up the configuration management process**

> d) is correct. Test scripts should be subject to configuration management, so it makes no sense to create the test scripts before this process is set up. Options a), b), and c) are all valid examples of shift-left: a) is early review of work products (static testing early), b) is test-first approach (TDD), and c) is performing non-functional testing at the component test level instead of later in the SDLC.

---

## Question #12 (1 Point) (2.1.6.I012)

Which of the arguments below would you use to convince your manager to organize retrospectives at the end of each release cycle?

**Selections:**

- a) Retrospectives are very popular these days and clients would appreciate it if we added them to our processes
- b) Organizing retrospectives will save the organization money because without them end user representatives do not provide immediate feedback about the product
- c) Process weaknesses identified during the retrospective can be analyzed and serve as a to do list for the organization's continuous process improvement program
- d) Retrospectives embrace five values including courage and respect, which are crucial to maintain continuous improvement in the organization

**✅ Answer: c) Process weaknesses identified during the retrospective can be analyzed and serve as a to do list for the organization's continuous process improvement program**

> c) is correct. Regularly conducted retrospectives, when appropriate follow up activities occur, are critical to continual improvement of development and testing. Retrospectives look back at the work done to identify process weaknesses and derive concrete improvement actions. Option a) is not a valid argument (popularity is not a reason), b) is incorrect because retrospectives are about process improvement, not end-user product feedback, and d) is incorrect because the five values (including courage and respect) belong to the Agile Manifesto / Extreme Programming, not retrospectives.

---

## Question #13 (1 Point) (2.2.1.I013)

Which types of failures (1-4) fit which test levels (A-D) BEST?

1. Failures in system behavior as it deviates from the user's business needs
2. Failures in communication between components
3. Failures in logic in a module
4. Failures in not correctly implemented business rules

- A. Component testing
- B. Component integration testing
- C. System testing
- D. Acceptance testing

**Selections:**

- a) 1D, 2B, 3A, 4C
- b) 1D, 2B, 3C, 4A
- c) 1B, 2A, 3D, 4C
- d) 1C, 2B, 3A, 4D

**✅ Answer: a) 1D, 2B, 3A, 4C**

> a) is correct. Considering:
> - The test basis for acceptance testing is the user's business needs (1D)
> - Communication between components is tested during component integration testing (2B)
> - Failures in logic can be found during component testing (3A)
> - Business rules are the test basis for system testing (4C)

---

## Question #14 (1 Point) (2.2.2.I014)

You are testing a user story with three acceptance criteria: AC1, AC2 and AC3. AC1 is covered by test case TC1, AC2 by TC2, and AC3 by TC3. The test execution history had three test runs on three consecutive versions of the software (tests 1-3 in Execution 1, tests 4-6 in Execution 2, tests 7-9 in Execution 3).

Tests are repeated once you are informed that all defects found in the test run are corrected and a new version of the software is available.

Which of the above tests are executed as regression tests?

**Selections:**

- a) Only 4, 7, 8, 9
- b) Only 5, 7
- c) Only 4, 6, 8, 9
- d) Only 5, 6

**✅ Answer: b) Only 5, 7**

> b) is correct. Because TC1 and TC3 failed in Execution 1 (i.e., test (1) and test (3)), test (4) and test (6) are confirmation tests. Because TC2 and TC3 failed in Execution 2 (i.e., tests (5) and (6)), test (8) and test (9) are also confirmation tests. TC2 passed in Execution 1 (i.e., test (2)), so test (5) is a regression test. TC1 passed in the Execution 2 (i.e., test (4)), so test (7) is also a regression test. A confirmation test re-runs a test that previously failed to confirm the fix; a regression test re-runs a test that previously passed to check the fix didn't break anything.

---

## Question #15 (1 Point) (3.1.1.I015)

Which of the following is NOT a benefit of static testing?

**Selections:**

- a) Having less expensive defect management due to the ease of detecting defects later in the SDLC
- b) Fixing defects found during static testing is generally much less expensive than fixing defects found during dynamic testing
- c) Finding coding defects that might not have been found by only performing dynamic testing
- d) Detecting gaps and inconsistencies in requirements

**✅ Answer: a) Having less expensive defect management due to the ease of detecting defects later in the SDLC**

> a) is correct. Defect management is no less expensive. Finding and fixing defects later in SDLC is more costly. Options b), c), and d) are all genuine benefits of static testing: defects found early (before code is executed) are cheaper to fix, static analysis can find coding defects that dynamic testing may miss, and reviews can detect gaps and inconsistencies in requirements.

---

## Question #16 (1 Point) (2.1.2.I016)

Which of the following is a benefit of early and frequent feedback?

**Selections:**

- a) It improves the test process for future projects
- b) It forces customers to prioritize their requirements based on agreed risks
- c) It provides a measure for the quality of changes
- d) It helps avoid requirements misunderstandings

**✅ Answer: d) It helps avoid requirements misunderstandings**

> d) is correct. Early and frequent feedback can prevent misunderstandings about requirements. When feedback loops are short (e.g., through reviews, iterations, and close collaboration with stakeholders), any misunderstanding of the requirements is detected and corrected early, before it propagates into design and code. The other options do not describe benefits of early and frequent feedback.

---

## Question #17 (1 Point) (3.2.2.I017)

The reviews being used in your organization have the following attributes:

- There is the role of a scribe
- The main purpose is to evaluate quality
- The meeting is led by the author of the work product
- There is individual preparation
- A review report is produced

Which of the following review types is MOST likely being used?

**Selections:**

- a) Informal review
- b) Walkthrough
- c) Technical review
- d) Inspection

**✅ Answer: b) Walkthrough**

> b) is correct. Considering the attributes:
> - A scribe is specified for walkthroughs, technical reviews, and inspections; thus, the reviews being performed cannot be informal reviews
> - The purpose of evaluating quality is one of the most important objectives of a walkthrough
> - The meeting led by the author is not allowed for inspections and is typically not done in technical reviews (a moderator is needed in walkthroughs and is allowed for informal reviews)
> - All types of reviews can include individual preparation (even informal reviews)
> - All types of reviews can produce a review report, although informal reviews do not require documentation

---

## Question #18 (1 Point) (3.2.4.I018)

Which of these statements is NOT a factor that contributes to successful reviews?

**Selections:**

- a) Participants should dedicate adequate time for the review
- b) Splitting large work products into small parts to make the required effort less intense
- c) Participants should avoid behaviors that might indicate boredom, exasperation, or hostility to other participants
- d) Failures found should be acknowledged, appreciated, and handled objectively

**✅ Answer: d) Failures found should be acknowledged, appreciated, and handled objectively**

> d) is correct. During reviews one can find defects, not failures. Reviews are a form of static testing, which works on work products without executing the code — so failures (which require execution) cannot occur. The correct statement would be "defects found should be acknowledged, appreciated, and handled objectively". Options a), b), and c) are all recognized success factors for reviews.

---

## Question #19 (1 Point) (4.1.1.I019)

Which of the following is a characteristic of experience-based test techniques?

**Selections:**

- a) Test cases are created based on detailed design information
- b) Items tested within the interface code section are used to measure coverage
- c) The techniques heavily rely on the tester's knowledge of the software and the business domain
- d) The test cases are used to identify deviations from the requirements

**✅ Answer: c) The techniques heavily rely on the tester's knowledge of the software and the business domain**

> c) is correct. This is a common characteristic of experience-based test techniques. This knowledge and experience include expected use of the software, its environment, likely defects, and the distribution of those defects is used to define tests. Option a) describes black-box techniques (based on specifications), b) describes white-box techniques (coverage measured on code), and d) describes black-box techniques as well (checking against requirements).

---

## Question #20 (1 Point) (4.2.1.I020)

You are testing a simplified apartment search form which has only two search criteria:

- floor (with three possible options: ground floor; first floor; second or higher floor)
- garden type (with three possible options: no garden; small garden; large garden)

Only apartments on the ground floor have gardens. The form has a built-in validation mechanism that will not allow you to use the search criteria which violate this rule.

Each test has two input values: floor and garden type. You want to apply equivalence partitioning (EP) to cover each floor and each garden type in your tests.

What is the minimal number of test cases to achieve 100% EP coverage?

**Selections:**

- a) 3
- b) 4
- c) 5
- d) 6

**✅ Answer: b) 4**

> b) is correct. "Small garden" and "large garden" can go only with "ground floor", so we need two test cases with "ground floor" which cover these two "garden type" partitions. We need two more test cases to cover the two other "floor" partitions and a remaining "garden type" partition of "no garden". We need a total of four test cases:
> - TC1 (ground floor, small garden)
> - TC2 (ground floor, large garden)
> - TC3 (first floor, no garden)
> - TC4 (second or higher floor, no garden)

---

## Question #21 (1 Point) (4.2.2.I021)

You are testing a system that calculates the final course grade for a given student.

The final grade is assigned based on the final result, according to the following rules:

- 0 – 50 points: failed
- 51 – 60 points: fair
- 61 – 70 points: satisfactory
- 71 – 80 points: good
- 81 – 90 points: very good
- 91 – 100 points: excellent

You have prepared a set of test cases (TC1 – 91, TC2 – 50, TC3 – 81, TC4 – 60, TC5 – 70, TC6 – 45, TC7 – 51).

What is the 2-value Boundary Value Analysis (BVA) coverage for the final result that is achieved with the existing test cases?

**Selections:**

- a) 50%
- b) 60%
- c) 33.3%
- d) 100%

**✅ Answer: a) 50%**

> a) is correct. There are 12 boundary values for the final result values: 0, 50, 51, 60, 61, 70, 71, 80, 81, 90, 91, and 100. The test cases cover six of them (TC1 – 91, TC2 – 50, TC3 – 81, TC4 – 60, TC5 – 70 and TC7 – 51). Therefore, the test cases cover 6/12 = 50%. Note that TC6 (45) is not a boundary value, so it does not contribute to the coverage.

---

## Question #22 (1 Point) (4.2.3.I022)

Your favorite bicycle daily rental store has just introduced a new Customer Relationship Management system and asked you, one of their most loyal members, to test it.

The implemented features are as follows:

- Anyone can rent a bicycle, but members receive a 20% discount
- However, if the return deadline is missed, the discount is no longer available
- After 15 rentals, members get a gift: a T-Shirt

Decision table describing the implemented features looks as follows (conditions: member?, deadline missed?, 15th rental?; actions: discount, gift T-Shirt).

Based ONLY on the feature description of the Customer Relationship Management system, which of the above rules describes an impossible situation?

**Selections:**

- a) R4
- b) R2
- c) R6
- d) R8

**✅ Answer: d) R8**

> d) is correct. No discount as a non-member that has also missed a deadline, but only members can receive a gift T-Shirt. Hence, the action is not correct. R8 describes a non-member who receives a gift T-Shirt — but according to the feature description, only members can receive the gift after 15 rentals, so this rule describes an impossible situation.

---

## Question #23 (1 Point) (4.2.4.I023)

You test a system whose lifecycle is modeled by the state transition diagram shown below. The system starts in the INIT state and ends its operation in the OFF state.

What is the MINIMAL number of test cases to achieve valid transitions coverage?

**Selections:**

- a) 4
- b) 2
- c) 7
- d) 3

**✅ Answer: d) 3**

> d) is correct. "test" and "error" transitions cannot occur in one test case. Neither can both "done" transitions. This means we need at least three test cases to achieve transition coverage. For example:
> - TC1: test, done
> - TC2: run, error, done
> - TC3: run, pause, resume, pause, done

---

## Question #25 (1 Point) (4.3.1.I025)

Which of the following is NOT true for white-box testing?

**Selections:**

- a) During white-box testing the entire software implementation is considered
- b) White-box coverage metrics can help identify additional tests to increase code coverage
- c) White-box test techniques can be used in static testing
- d) White-box testing can help identify gaps in requirements implementation

**✅ Answer: d) White-box testing can help identify gaps in requirements implementation**

> d) is correct. This is the weakness of the white-box test techniques. They are not able to identify the missing implementation, because they are based solely on the test object structure, not on the requirements specification. If a requirement was never implemented, white-box testing (which only looks at the code) cannot detect the gap — only black-box techniques based on the requirements can.

---

## Question #26 (1 Point) (4.4.1.I026)

Which of the following BEST describes the concept behind error guessing?

**Selections:**

- a) Error guessing involves using your knowledge and experience of defects found in the past and typical errors made by developers
- b) Error guessing involves using your personal experience of development and the errors you made as a developer
- c) Error guessing requires you to imagine that you are the user of the test object and to guess errors the user could make interacting with it
- d) Error guessing requires you to rapidly duplicate the development task to identify the sort of errors a developer might make

**✅ Answer: a) Error guessing involves using your knowledge and experience of defects found in the past and typical errors made by developers**

> a) is correct. The basic concept behind error guessing is that the tester tries to guess what errors may have been made by the developer and what defects may be in the test object based on past experience (and sometimes checklists). Options b), c), and d) describe it incorrectly: it is the tester's experience of defects, not the developer's own errors; it is not about imagining user errors; and it does not require duplicating the development task.

---

## Question #27 (1 Point) (4.4.2.I027)

In your project there has been a delay in the release of a brand-new application and test execution started late, but you have very detailed domain knowledge and good analytical skills. The full list of requirements has not yet been shared with the team, but management is asking for some test results to be presented.

Which test technique fits BEST in this situation?

**Selections:**

- a) Checklist-based testing
- b) Error guessing
- c) Exploratory testing
- d) Branch testing

**✅ Answer: c) Exploratory testing**

> c) is correct. Exploratory testing is most useful when there are few known specifications and/or there is a pressing timeline for testing. In this scenario, the requirements are incomplete (no full list shared) and there is time pressure (delayed release, management asking for results) — combined with the tester's strong domain knowledge and analytical skills, exploratory testing fits best. Black-box techniques like checklist-based testing would need specifications, and branch testing (white-box) needs the code structure.

---

## Question #28 (1 Point) (4.5.1.I028)

Which of the following BEST describes the way acceptance criteria can be documented?

**Selections:**

- a) Performing retrospectives to determine the actual needs of the stakeholders regarding a given user story
- b) Using the given/when/then format to describe an example test condition related to a given user story
- c) Using verbal communication to reduce the risk of misunderstanding the acceptance criteria by others
- d) Documenting risks related to a given user story in a test plan to facilitate the risk-based testing of a given user story

**✅ Answer: b) Using the given/when/then format to describe an example test condition related to a given user story**

> b) is correct. This is the standard way to document acceptance criteria. The given/when/then format (also used in BDD) provides a clear, structured, and verifiable way to express acceptance criteria as example test conditions. Option a) confuses acceptance criteria with retrospectives, c) is wrong because verbal communication alone does not document anything, and d) confuses acceptance criteria with risk documentation in a test plan.

---

## Question #29 (1 Point) (4.5.2.I029)

Consider the following user story:

- As an Editor
- I want to review content before it is published
- so that I can assure the grammar is correct

and its acceptance criteria:

- The user can log in to the content management system with "Editor" role
- The editor can view existing content pages
- The editor can edit the page content
- The editor can add markup comments
- The editor can save changes
- The editor can reassign to the "content owner" role to make updates

Which of the following is the BEST example of an ATDD test for this user story?

**Selections:**

- a) Test if the editor can save the document after edit the page content
- b) Test if the content owner can log in and make updates to the content
- c) Test if the editor can schedule the edited content for publication
- d) Test if the editor can reassign to another editor to make updates

**✅ Answer: a) Test if the editor can save the document after edit the page content**

> a) is correct. This test covers two acceptance criteria: one about editing the document and one about saving changes. Options b), c), and d) do not match the acceptance criteria: b) tests the content owner role instead of the editor, c) "schedule for publication" is not in the acceptance criteria, and d) reassigning to another editor contradicts the criterion which states reassigning to the "content owner" role.

---

## Question #30 (1 Point) (5.1.1.I030)

How do testers add value to iteration and release planning?

**Selections:**

- a) Testers determine the priority of the user stories to be developed
- b) Testers focus only on the functional aspects of the system to be tested
- c) Testers participate in the detailed risk identification and risk assessment of user stories
- d) Testers guarantee the release of high-quality software through early test design during the release planning

**✅ Answer: c) Testers participate in the detailed risk identification and risk assessment of user stories**

> c) is correct. According to the syllabus, this is one of the ways testers add value to iteration and release planning. Option a) is incorrect because prioritizing user stories is the product owner's responsibility, b) is incorrect because testers consider both functional and non-functional aspects, and d) is incorrect because testers cannot "guarantee" quality — testing only shows the presence of defects, not their absence.

---

## Question #31 (1 Point) (5.1.2.I031)

Which of the following options are the exit criteria for testing a system?

**Selections:**

- a) Test environment readiness
- b) The ability to log in to the test object by the tester
- c) Estimated defect density is reached
- d) Requirements are translated into given/when/then format

**✅ Answer: c) Estimated defect density is reached**

> c) is correct. Estimated defect density is a measure of diligence; hence it belongs to the exit criteria. Exit criteria define when to stop testing (e.g., measures of test coverage, defect density, unresolved defects). Options a) and b) are entry criteria (conditions to start testing), and d) is a BDD practice, not an exit criterion.

---

## Question #32 (1 Point) (5.1.3.I032)

Your team uses the three-point estimation technique to estimate the test effort for a new high-risk feature. The following estimates were made:

- Most optimistic estimation: 2 person-hours
- Most likely estimation: 11 person-hours
- Most pessimistic estimation: 14 person-hours

What is the final estimate?

**Selections:**

- a) 9 person-hours
- b) 14 person-hours
- c) 11 person-hours
- d) 10 person-hours

**✅ Answer: d) 10 person-hours**

> d) is correct. In the three-point estimation technique: E = (optimistic + 4*most likely + pessimistic)/6. E = (2 + (4*11) + 14)/6 = 60/6 = 10 person-hours.

---

## Question #33 (1 Point) (5.1.4.I033)

You are testing a mobile application that allows users to find a nearby restaurant based on the type of food they want to eat. Consider the following list of test cases, priorities (i.e., a smaller number means a higher priority), and dependencies (TC001 – no dependency; TC002 – depends on TC001; TC003 – depends on TC001; TC004 – depends on TC002 and TC003; TC005 – depends on TC003).

Which of the following test cases should be executed as the third one?

**Selections:**

- a) TC 003
- b) TC 005
- c) TC 002
- d) TC 001

**✅ Answer: a) TC 003**

> a) is correct. Test TC 001 must come first, followed by TC 002, to satisfy dependencies. Afterwards, TC 003 to satisfy priority and then TC 004, followed by TC 005. The execution order is determined by both dependencies (a test can only run after the tests it depends on) and priorities (smaller number = higher priority).

---

## Question #34 (1 Point) (5.1.5.I034)

Consider the following test categories (1-4) and agile testing quadrants (A-D):

1. Usability testing
2. Component testing
3. Functional testing
4. Reliability testing

- A. Agile testing quadrant Q1: technology facing, supporting the development team
- B. Agile testing quadrant Q2: business facing, supporting the development team
- C. Agile testing quadrant Q3: business facing, critique the product
- D. Agile testing quadrant Q4: technology facing, critique the product

How do the following test categories map onto the agile testing quadrants?

**Selections:**

- a) 1C, 2A, 3B, 4D
- b) 1D, 2A, 3C, 4B
- c) 1C, 2B, 3D, 4A
- d) 1D, 2B, 3C, 4A

**✅ Answer: a) 1C, 2A, 3B, 4D**

> a) is correct. Considering:
> - Usability testing is in Q3 (1 – C)
> - Component testing is in Q1 (2 – A)
> - Functional testing is in Q2 (3 – B)
> - Reliability testing is in Q4 (4 – D)

---

## Question #35 (1 Point) (5.2.1.I035)

During a risk analysis the following risk was identified and assessed:

- Risk: Response time is too long to generate a report
- Risk likelihood: medium; risk impact: high
- Response to risk:
  - An independent test team performs performance testing during system testing
  - A selected sample of end users performs alpha and beta acceptance testing before the release

What measure is proposed to be taken in response to this analyzed risk?

**Selections:**

- a) Risk acceptance
- b) Contingency plan
- c) Risk mitigation
- d) Risk transfer

**✅ Answer: c) Risk mitigation**

> c) is correct. The proposed actions are related to testing, which is a form of risk mitigation. Risk mitigation involves taking proactive steps to reduce the risk (likelihood and/or impact) before it occurs — here, performance testing and acceptance testing are performed to detect and address the response time issue early. A contingency plan would be a pre-planned reaction after the risk materializes, risk acceptance means doing nothing, and risk transfer means passing the risk to a third party.

---

## Question #36 (1 Point) (5.3.1.I036)

Which work product can be used by an agile team to show the amount of work that has been completed and the amount of total work remaining for a given iteration?

**Selections:**

- a) Acceptance criteria
- b) Defect report
- c) Test completion report
- d) Burndown chart

**✅ Answer: d) Burndown chart**

> d) is correct. Burndown charts are a graphical representation of work left to do versus time remaining. They are updated daily, so they can continuously show the work progress. Acceptance criteria define conditions for a user story, defect reports document anomalies, and test completion reports summarize testing at the end of a test level — none of them track iteration progress.

---

## Question #37 (1 Point) (5.4.1.I037)

You need to update one of the automated test scripts to be in line with a new requirement. Which process indicates that you create a new version of the test script in the test repository?

**Selections:**

- a) Traceability management
- b) Maintenance testing
- c) Configuration management
- d) Requirements engineering

**✅ Answer: c) Configuration management**

> c) is correct. To support testing, configuration management may involve the version control of all test items. Creating a new version of a test script in the repository is a version control activity, which is the essence of configuration management. Traceability management links requirements to tests, maintenance testing is testing changes, and requirements engineering is about defining requirements.

---

## Question #38 (1 Point) (5.5.1.I038)

You received the following defect report from the developers stating that the anomaly described in this test report is not reproducible.

- Application hangs up
- 2022-May-03 – John Doe – Rejected
- The application hangs up after entering "Test input: $ä" in the Name field on the new user creation screen. Tried to log off, log in with test_admin01 account, same issue. Tried with other test admin accounts, same issue. No error message received; log (see attached) contains fatal error notification. Based on the test case TC-1305, the application should accept the provided input and create the user. Please fix with high priority, this feature is related to REQ-0012, which is a critical new business requirement.

What critical information is MISSING from this test report that would have been useful for the developers?

**Selections:**

- a) Expected result and actual result
- b) References and defect status
- c) Test environment and test item
- d) Priority and severity

**✅ Answer: c) Test environment and test item**

> c) is correct. We do not know in which test environment the anomaly was detected, and we also do not know which application (and its version) is affected. This is exactly why the developers could not reproduce the defect. The report already contains expected/actual results (a), references and status (b), and priority (d).

---

## Question #39 (1 Point) (6.1.1.I039)

Which test activity does a data preparation tool support?

**Selections:**

- a) Test monitoring and control
- b) Test analysis
- c) Test design and implementation
- d) Test completion

**✅ Answer: c) Test design and implementation**

> c) is correct. Test design and implementation can both include the identification, creation or acquisition of the testware necessary for test execution (e.g., test data). A data preparation tool helps create/acquire test data, which is part of test implementation.

---

## Question #40 (1 Point) (6.1.1.I040)

Which item correctly identifies a potential risk of performing test automation?

**Selections:**

- a) It may introduce unknown regressions in production
- b) Sufficient efforts to maintain testware may not be properly allocated
- c) Testing tools and associated testware may not be sufficiently relied upon
- d) It may reduce the time allocated for manual testing

**✅ Answer: b) Sufficient efforts to maintain testware may not be properly allocated**

> b) is correct. Wrong allocation of effort to maintain testware is a risk. According to the syllabus, risks of test automation include: unrealistic expectations, underestimating the time/cost/effort for maintaining testware, over-reliance on tooling, and over-dependence on a vendor. Options a), c), and d) are not recognized risks — automation does not introduce regressions in production, tools may be relied upon (over-reliance is the risk, not under-reliance), and reducing manual testing time is a benefit, not a risk.

---

## Question #A1 (1 Point) (1.1.1.I041)

You were given a task to analyze and fix causes of failures in a new system to be released.

Which activity are you performing?

**Selections:**

- a) Debugging
- b) Software testing
- c) Requirement elicitation
- d) Defect management

**✅ Answer: a) Debugging**

> a) is correct. Debugging is the process of finding, analyzing, and removing the causes of failures in a component or system. Software testing triggers failures, but debugging is what locates and fixes their causes. Requirement elicitation is about gathering requirements, and defect management is about the lifecycle of defect reports.

---

## Question #A2 (1 Point) (1.1.2.I042)

In many software organizations the test department is called the Quality Assurance (QA) department. Is this sentence correct or not and why?

**Selections:**

- a) It is correct. Testing and QA mean exactly the same thing
- b) It is correct. These names can be used interchangeably because both testing and QA focus their activities on the same quality issues
- c) It is not correct. Testing is something more; testing includes all activities with regard to quality. QA focuses on quality-related processes
- d) It is not correct. QA is focused on quality-related processes while testing concentrates on demonstrating that a component or system is fit for purpose and to detect defects

**✅ Answer: d) It is not correct. QA is focused on quality-related processes while testing concentrates on demonstrating that a component or system is fit for purpose and to detect defects**

> d) is correct. Testing and quality assurance are not the same. Testing is the process consisting of all software development lifecycle (SDLC) activities, both static and dynamic, concerned with planning, preparation and evaluation of a component or system and related work products to determine that they satisfy specified requirements, to demonstrate that they are fit for purpose and to detect defects. Quality assurance is focused on establishing, introducing, monitoring, improving, and adhering to the quality-related processes.

---

## Question #A3 (1 Point) (1.1.3.I043)

A phone ringing in a neighboring cubicle distracts a programmer causing him to improperly program the logic that checks the upper boundary of an input variable. Later, during system testing, a tester notices that this input field accepts invalid input values.

Which of the following correctly describes an incorrectly coded upper bound?

**Selections:**

- a) The root cause
- b) A failure
- c) An error
- d) A defect

**✅ Answer: d) A defect**

> d) is correct. The problem in the code is a defect. The chain is: error (the distracted programmer) → defect (the incorrectly coded upper bound in the code) → failure (the system accepting invalid input values). The phone ringing would be the root cause, and the observed incorrect behavior during testing is the failure.

---

## Question #A4 (1 Point) (1.4.1.I044)

Consider the following testware (a test charter).

Which test activity produces this testware as an output?

**Selections:**

- a) Test planning
- b) Test monitoring and control
- c) Test analysis
- d) Test design

**✅ Answer: d) Test design**

> d) is correct. The testware under consideration is a test charter. Test charters are the output from test design. Test charters are typically used in exploratory testing (an experience-based technique) and are created during test design activity.

---

## Question #A5 (1 Point) (1.4.4.I045)

Which of the following is the BEST example of how traceability supports testing?

**Selections:**

- a) Performing the impact analysis of a change will give information about the completion of the tests
- b) Analyzing the traceability between test cases and test results will give information about the estimated level of residual risk
- c) Performing the impact analysis of a change will help selecting the right test cases for regression testing
- d) Analyzing the traceability between the test basis, the test objects and the test cases will help in selecting test data to achieve the assumed coverage of the test object

**✅ Answer: c) Performing the impact analysis of a change will help selecting the right test cases for regression testing**

> c) is correct. Performing the impact analysis of the changes helps in selecting the test cases for the regression test. Traceability between the test basis and test cases allows testers to identify which tests are affected by a change and select them for regression testing.

---

## Question #A6 (1 Point) (1.5.1.I046)

Which of the following BEST explains a benefit of independence of testing?

**Selections:**

- a) The use of an independent test team allows project management to assign responsibility for the quality of the final deliverable to the test team
- b) If a test team external to the organization can be afforded, then there are distinct benefits in terms of this external team not being so easily swayed by the delivery concerns of project management and the need to meet strict delivery deadlines
- c) An independent test team can work separately from the developers, need not be distracted with project requirement changes, and can restrict communication with the developers to defect reporting through the defect management system
- d) When specifications contain ambiguities and inconsistencies, assumptions are made on their interpretation, and an independent tester can be useful in questioning those assumptions and the interpretation made by the developer

**✅ Answer: d) When specifications contain ambiguities and inconsistencies, assumptions are made on their interpretation, and an independent tester can be useful in questioning those assumptions and the interpretation made by the developer**

> d) is correct. Specifications are never perfect, meaning that assumptions will have to be made by the developer. An independent tester is useful in that they can challenge and verify the assumptions and subsequent interpretation made by the developer. Options a), b), and c) describe drawbacks or incorrect statements: quality responsibility cannot be assigned to the test team, and isolating the test team from developers/requirements is a drawback, not a benefit.

---

## Question #A7 (1 Point) (2.1.1.I047)

You are working as a tester in the team that follows the V-model. Which of the following activities CAN be performed in the initial phases of the SDLC?

**Selections:**

- a) Dynamic test execution
- b) Static testing
- c) Maintenance testing
- d) Acceptance test execution

**✅ Answer: b) Static testing**

> b) is correct. In sequential development models, in the initial phases, testers participate in requirement reviews, which is a form of static testing. Static testing does not require executable code, so it can be performed on work products like requirements and design documents early in the SDLC. Dynamic test execution (a, d) requires running code, and maintenance testing (c) applies to changes after release.

---

## Question #A8 (1 Point) (2.1.3.I048)

Which of the following are advantages of DevOps?

- i. Faster product release and faster time to market
- ii. Increases the need for repetitive manual testing
- iii. Constant availability of executable software
- iv. Reduction in the number of regression tests associated with code refactoring
- v. Setting up the test automation framework is inexpensive since everything is automated

**Selections:**

- a) i, ii, iv are advantages
- b) iii, v are advantages
- c) i, iii are advantages
- d) ii, iv, v are advantages

**✅ Answer: c) i, iii are advantages**

> c) is correct. Consider:
> - i. Is true. Faster product release and faster time to market is an advantage of DevOps
> - ii. Is false. Typically, we need less effort for manual tests because of the use of test automation
> - iii. Is true. Constant availability of executable software is an advantage
> - iv. Is false. More regression tests are needed
> - v. Is false. Not everything is automated and setting up a test automation framework is expensive

---

## Question #A9 (1 Point) (2.2.1.I049)

You work as a tester in a project on a mobile application for food ordering for one of your clients. The client sent you a list of requirements. One of them, with high priority, says

- "The order must be processed in less than 10 seconds in 95% of the cases".

You created a set of test cases in which a number of random orders were made, the processing time measured, and the test results were checked against the requirements.

What test type did you perform?

**Selections:**

- a) Functional, because the test cases cover the user's business requirement for the system
- b) Non-functional, because the measure the system's performance
- c) Functional, because the test cases interact with the user interface
- d) Structural, because we need to know the internal structure of the program to measure the order processing time

**✅ Answer: b) Non-functional, because the measure the system's performance**

> b) is correct. The requirement "processed in less than 10 seconds in 95% of cases" is a performance efficiency requirement (HOW WELL the system performs), not WHAT the system does. Measuring processing time is performance testing, which is a non-functional test type. Even though the requirement comes from the client, testing "how fast" rather than "what" makes it non-functional.

---

## Question #A10 (1 Point) (2.3.1.I050)

Your organization's test strategy suggests that once a system is going to be retired, data migration shall be tested. As part of what test type is this testing MOST likely to be performed?

**Selections:**

- a) Maintenance testing
- b) Regression testing
- c) Component testing
- d) Integration testing

**✅ Answer: a) Maintenance testing**

> a) is correct. When a system is retired, this can require testing of data migration, which is a form of maintenance testing. Maintenance testing is triggered by modifications (enhancements, corrections) as well as system retirement — including data migration to another system and archiving of data.

---

## Question #A11 (1 Point) (3.1.1.I051)

The following is a list of the work products produced in the SDLC.

- i. Business requirements
- ii. Schedule
- iii. Test budget
- iv. Third-party executable code
- v. User stories and their acceptance criteria

Which of them can be reviewed?

**Selections:**

- a) i and iv can be reviewed
- b) i, ii, iii and iv can be reviewed
- c) i, ii, iii, and v can be reviewed
- d) iii, iv, v can be reviewed

**✅ Answer: c) i, ii, iii, and v can be reviewed**

> c) is correct. Only third-party executable code cannot be reviewed. Work products that are not appropriate for static testing include those that are difficult to interpret by human beings and should not be analyzed by tools (e.g., third-party executable code due to legal reasons). Business requirements, schedules, test budgets, and user stories with acceptance criteria are all human-readable documents that can be reviewed.

---

## Question #A12 (1 Point) (3.1.2.I052)

Decide which of the following statements (i-v) are true for static testing.

- i. Abnormal external behaviors are easier to identify with this testing
- ii. Discrepancies from a coding standard are easier to find with this testing
- iii. It identifies failures caused by defects when the software is run
- iv. Its test objective is to identify defects as early as possible
- v. Missing coverage for critical security requirements is easier to find and fix

**Selections:**

- a) i, iv, v are true for static testing
- b) i, iii, iv are true for static testing
- c) ii, iii are true for static testing
- d) ii, iv, v are true for static testing

**✅ Answer: d) ii, iv, v are true for static testing**

> d) is correct. Consider:
> - i. These behaviors are easily detectable while the software is running. Hence, dynamic testing shall be used to identify them
> - ii. This is an example of deviations from standards, which is a typical defect that is easier found with static testing
> - iii. If the software is executed during the test, it is dynamic testing
> - iv. Identifying defects as early as possible is the test objective of both static testing and dynamic testing
> - v. This is an example of gaps in the test basis traceability or coverage, which is a typical defect that is easier found with static testing

---

## Question #A13 (1 Point) (3.2.1.I053)

Which of the following statements about formal reviews is TRUE?

**Selections:**

- a) Some reviews do not require more than one role
- b) The review process has several activities
- c) Documentation to be reviewed is not distributed before the review meeting, with the exception of the work product for specific review types
- d) Defects found during the review are not reported since they are not found by dynamic testing

**✅ Answer: b) The review process has several activities**

> b) is correct. There are several activities during the formal review process: Planning, Review Initiation, Individual Review, Communication and Analysis, and Fixing and Reporting. Options a), c), and d) are false: formal reviews involve multiple roles, work products are distributed before the meeting for individual review, and defects found during reviews are reported.

---

## Question #A14 (1 Point) (3.2.3.I054)

What task may management take on during a formal review?

**Selections:**

- a) Taking overall responsibility for the review
- b) Deciding what is to be reviewed
- c) Ensuring the effective running of review meetings, and mediating, if necessary
- d) Recording review information such as review decisions

**✅ Answer: b) Deciding what is to be reviewed**

> b) is correct. This is the task of the management in a formal review. Management decides what is to be reviewed and provides resources (staff, time) for the review. Option a) is the review leader's task, c) is the facilitator's (moderator's) task, and d) is the scribe's task.

---

## Question #A15 (1 Point) (4.2.2.I055)

A wine storage system uses a control device that measures the wine cell temperature T (measured in °C, rounded to the nearest degree) and alarms the user if it deviates from the optimal value of 12, according to the following rules:

- if T = 12, the system says, "optimal temperature"
- if T < 12, the system says, "temperature is too low!"
- if T > 12, the system says, "temperature is too high!"

You want to use the 3-point boundary value analysis (BVA) to verify the behavior of the control device. A test input is a temperature in °C provided by the device.

What is the MINIMAL set of test inputs that achieves 100% of the desired coverage?

**Selections:**

- a) 11, 12, 13
- b) 10, 12, 14
- c) 10, 11, 12, 13, 14
- d) 10, 11, 13, 14

**✅ Answer: c) 10, 11, 12, 13, 14**

> c) is correct. There are three equivalence partitions: {..., 10, 11}, {12}, and {13, 14, ...}. The boundary values are 11, 12 and 13. In the three-point boundary value analysis for each boundary, we need to test the boundary and both its neighbors, so:
> - for 11 we test 10, 11, 12
> - for 12 we test 11, 12, 13
> - for 13 we test 12, 13, 14
>
> Altogether we need to test 10, 11, 12, 13, and 14

---

## Question #A16 (1 Point) (4.3.2.I056)

Which of the following statements about branch testing is CORRECT?

**Selections:**

- a) If a program includes only unconditional branches, then 100% branch coverage can be achieved without executing any test cases
- b) If the test cases exercise all unconditional branches in the code, then 100% branch coverage is achieved
- c) If 100% statement coverage is achieved, then 100% branch coverage is also achieved
- d) If 100% branch coverage is achieved, then all decision outcomes in each decision statement in the code are exercised

**✅ Answer: d) If 100% branch coverage is achieved, then all decision outcomes in each decision statement in the code are exercised**

> d) is correct. Each decision outcome corresponds to a conditional branch, so 100% branch coverage implies 100% decision coverage. Option c) is wrong because statement coverage does not imply branch coverage (a decision can be executed while only one outcome is taken), and a) and b) are wrong because coverage requires executing test cases and covering conditional branches.

---

## Question #A17 (1 Point) (4.4.3.I057)

You are testing a mobile application that allows customers to access and manage their bank accounts. You are running a test suite that involves evaluating each screen, and each field on each screen, against a general list of user interface best practices derived from a popular book on the topic that maximizes attractiveness, ease-of-use, and accessibility for such applications. Which of the following options BEST categorizes the test technique you are using?

**Selections:**

- a) Black-box
- b) Exploratory
- c) Checklist-based
- d) Error guessing

**✅ Answer: c) Checklist-based**

> c) is correct. The list of user interface best practices is the list of test conditions to be systematically checked. Checklist-based testing involves designing, implementing and executing tests to cover test conditions from a checklist — here, the UI best practices list serves as the checklist.

---

## Question #A18 (1 Point) (4.5.1.I058)

Which of the following BEST describe the collaborative approach to user story writing?

**Selections:**

- a) User stories are created by testers and developers and then accepted by business representatives
- b) User stories are created by business representatives, developers, and testers together
- c) User stories are created by business representatives and verified by developers and testers
- d) User stories are created in a way that they are independent, negotiable, valuable, estimable, small, and testable

**✅ Answer: b) User stories are created by business representatives, developers, and testers together**

> b) is correct. Collaborative user story writing means that all stakeholders create the user stories collaboratively, to obtain the shared vision. Option d) describes the INVEST criteria for good user stories, not the collaborative approach.

---

## Question #A19 (1 Point) (5.1.1.I059)

Consider the following part of a test plan.

- Testing will be performed using component testing and component integration testing. The regulations require to demonstrate that 100% branch coverage is achieved for each component classified as critical.

Which part of the test plan does this part belong to?

**Selections:**

- a) Communication
- b) Risk register
- c) Context of testing
- d) Test approach

**✅ Answer: d) Test approach**

> d) is correct. The paragraph contains information on test levels and exit criteria, which are part of the test approach. The test approach includes test levels, test types, test techniques, test deliverables, entry criteria and exit criteria, etc.

---

## Question #A20 (1 Point) (5.1.3.I060)

Your team uses planning poker to estimate the test effort for a newly required feature. There is a rule in your team that if there is no time to reach full agreement and the variation in the results is small, applying rules like "accept the number with the most votes" can be applied.

After two rounds, the consensus was not reached, so the third round was initiated. You can see the test estimation results in the table below (13 has the most votes).

Which of the following is the BEST example of the next step?

**Selections:**

- a) The product owner has to step in and make a final decision
- b) Accept 13 as the final test estimate as this has most of the votes
- c) No further action is needed. Consensus has been reached
- d) Remove the new feature from the current release because consensus has not been reached

**✅ Answer: b) Accept 13 as the final test estimate as this has most of the votes**

> b) is correct. If test estimates are not the same, but the variation in the results is small, applying rules like "accept the number with the most votes" can be applied. This is a standard practice in planning poker when consensus cannot be reached within the timebox.

---

## Question #A21 (1 Point) (5.1.7.I061)

Which of the following is TRUE regarding the test pyramid?

**Selections:**

- a) It emphasizes having far more tests at the lower test levels
- b) It suggests that each low-level test checks a large part of the functionality
- c) It describes distribution of test types across SDLC
- d) It has no impact on the construction of automated tests

**✅ Answer: a) It emphasizes having far more tests at the lower test levels**

> a) is correct. The test pyramid emphasizes having a larger number of tests at the lower test levels (unit/component tests), with fewer tests at higher levels (integration, end-to-end). Low-level tests are cheaper, faster, and more isolated — each checks a small part of functionality, not large parts.

---

## Question #A22 (1 Point) (5.2.1.I062)

During risk analysis the team considered the following risk: "The system allows too high a discount for a customer". The team estimated the risk impact to be very high.

What can one say about the risk likelihood?

**Selections:**

- a) It is also very high. High risk impact always implies high risk likelihood
- b) It is very low. High risk impact always implies low risk likelihood
- c) One cannot say anything about risk likelihood. Risk impact and risk likelihood are independent
- d) Risk likelihood is not important with such a high-risk impact. One does not need to define it.

**✅ Answer: c) One cannot say anything about risk likelihood. Risk impact and risk likelihood are independent**

> c) is correct. Risk impact and risk likelihood are independent. The impact (damage if the risk occurs) says nothing about the likelihood (probability of the risk occurring) — both must be assessed separately to determine the risk level.

---

## Question #A23 (1 Point) (5.2.2.I063)

The following list contains risks that have been identified for a new software product to be developed:

- i. Management moves two experienced testers to another project
- ii. The system does not comply with functional safety standards
- iii. System response time exceeds user requirements
- iv. Stakeholders have inaccurate expectations
- v. Disabled people have problems when using the system

Which of them are project risks?

**Selections:**

- a) i, iv are project risks
- b) iv, v are project risks
- c) i, iii are project risks
- d) ii, v are project risks

**✅ Answer: a) i, iv are project risks**

> a) is correct. Consider:
> - i. It is a Project risk (organizational — staffing)
> - ii. It is a Product risk
> - iii. It is a Product risk
> - iv. It is a Project risk (organizational — stakeholder expectations)
> - v. It is a Product risk

---

## Question #A24 (1 Point) (5.2.3.I064)

Which of the following is an example of how product risk analysis influences thoroughness and scope of testing?

**Selections:**

- a) The test manager monitors and reports the level of all known risks on a daily basis so the stakeholders can make an informed decision on the release date
- b) One of the identified risks was "Lack of support of open-source databases", so the team decided to integrate the system with an open-source database
- c) During the quantitative risk analysis, the team estimated the total level of all identified risks and reported it as the total residual risk before testing
- d) Risk assessment revealed a very high level of performance risks, so it was decided to perform detailed performance efficiency testing early in the SDLC

**✅ Answer: d) Risk assessment revealed a very high level of performance risks, so it was decided to perform detailed performance efficiency testing early in the SDLC**

> d) is correct. This shows how risk analysis impacts the thoroughness of testing (i.e., the level of detail). High risk leads to more detailed and earlier testing — directly influencing the scope and thoroughness of the test effort.

---

## Question #A25 (1 Point) (5.3.1.I065)

Which of the following options are common metrics used for reporting on the quality level of the test object?

**Selections:**

- a) Number of defects found during system testing
- b) Total effort on test design divided by the number of designed test cases
- c) Number of executed test procedures
- d) Time needed to repair a defect

**✅ Answer: a) Number of defects found during system testing**

> a) is correct. The number of defects found is related to the test object quality. Options b) and c) are metrics about the test process (effort, progress), and d) is a metric about the development/repair process, not the quality level of the test object.

---

## Question #A26 (1 Point) (5.3.2.I066)

Which of the following pieces of information contained in a test progress report is the LEAST useful for business representatives?

**Selections:**

- a) Impediments to testing
- b) Branch coverage achieved
- c) Test progress
- d) New risks within the test cycle

**✅ Answer: b) Branch coverage achieved**

> b) is correct. Branch testing is a technical metric used by developers and technical testers. This information is of no interest to business representatives. Impediments, test progress, and new risks are all business-relevant information for decision-making.

---
