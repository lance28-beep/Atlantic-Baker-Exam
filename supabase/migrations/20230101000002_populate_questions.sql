-- SAP Exam Questions (Multiple Choice)
INSERT INTO questions (exam_type, question_type, question_text, options, correct_answer)
VALUES
  ('SAP', 'multiple_choice', 'What does SAP stand for?', '["Systems, Applications, and Products in Data Processing", "System Analysis and Program Development", "Software Applications and Programs", "System Administration and Processing"]', '0'),
  ('SAP', 'multiple_choice', 'Which module in SAP handles financial accounting?', '["FI", "MM", "SD", "HR"]', '0'),
  ('SAP', 'multiple_choice', 'Which of the following is NOT a component of SAP ERP?', '["FI (Financial Accounting)", "MM (Materials Management)", "WM (Website Management)", "SD (Sales and Distribution)"]', '2'),
  ('SAP', 'multiple_choice', 'What is the purpose of the SAP MM module?', '["Materials Management", "Marketing Management", "Money Management", "Manufacturing Management"]', '0'),
  ('SAP', 'multiple_choice', 'Which SAP module is responsible for human resources management?', '["HR", "FI", "SD", "MM"]', '0');

-- SAP Exam Questions (True/False)
INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES
  ('SAP', 'true_false', 'SAP HANA is an in-memory database.', true),
  ('SAP', 'true_false', 'SAP R/3 is the latest version of SAP ERP.', false),
  ('SAP', 'true_false', 'SAP Fiori is a user interface technology.', true),
  ('SAP', 'true_false', 'SAP BW is used for business intelligence and data warehousing.', true),
  ('SAP', 'true_false', 'SAP can only be implemented on-premises and not in the cloud.', false);

-- SAP Exam Questions (Fill in the Blank)
INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES
  ('SAP', 'fill_in_blank', 'The SAP module that handles procurement and inventory management is called ________.', 'MM'),
  ('SAP', 'fill_in_blank', 'SAP ________ is the cloud-based ERP solution offered by SAP.', 'S/4HANA'),
  ('SAP', 'fill_in_blank', 'The SAP ________ module handles sales order processing and billing.', 'SD'),
  ('SAP', 'fill_in_blank', 'SAP ________ is used for production planning and manufacturing execution.', 'PP'),
  ('SAP', 'fill_in_blank', 'The SAP ________ module is used for financial reporting and controlling.', 'FI-CO');

-- Management Trainee Exam Questions (Multiple Choice)
INSERT INTO questions (exam_type, question_type, question_text, options, correct_answer)
VALUES
  ('Management Trainee', 'multiple_choice', 'Which of the following is NOT one of the five functions of management according to Henri Fayol?', '["Planning", "Organizing", "Commanding", "Innovating"]', '3'),
  ('Management Trainee', 'multiple_choice', 'What leadership style involves making decisions without consulting team members?', '["Democratic", "Laissez-faire", "Autocratic", "Transformational"]', '2'),
  ('Management Trainee', 'multiple_choice', 'Which of the following is a characteristic of a good SMART goal?', '["Subjective", "Measurable", "Ambitious", "Realistic"]', '1'),
  ('Management Trainee', 'multiple_choice', 'What is the first stage in Tuckman''s model of team development?', '["Forming", "Storming", "Norming", "Performing"]', '0'),
  ('Management Trainee', 'multiple_choice', 'Which of the following is NOT one of the components of emotional intelligence?', '["Self-awareness", "Social skills", "Technical proficiency", "Empathy"]', '2');

-- Management Trainee Exam Questions (True/False)
INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES
  ('Management Trainee', 'true_false', 'Maslow''s Hierarchy of Needs places self-actualization at the top of the pyramid.', true),
  ('Management Trainee', 'true_false', 'The Hawthorne Effect suggests that productivity decreases when workers know they are being observed.', false),
  ('Management Trainee', 'true_false', 'Theory X managers believe that employees are inherently motivated and enjoy work.', false),
  ('Management Trainee', 'true_false', 'The ADKAR model is a framework for change management.', true),
  ('Management Trainee', 'true_false', 'Herzberg''s Two-Factor Theory identifies salary as a motivator rather than a hygiene factor.', false);

-- Management Trainee Exam Questions (Fill in the Blank)
INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES
  ('Management Trainee', 'fill_in_blank', 'The management function that involves directing and influencing the tasks of subordinates is called ________.', 'leading'),
  ('Management Trainee', 'fill_in_blank', 'The ________ leadership style involves sharing decision-making authority with team members.', 'democratic'),
  ('Management Trainee', 'fill_in_blank', 'The process of setting standards, measuring performance, and taking corrective action is known as ________.', 'controlling'),
  ('Management Trainee', 'fill_in_blank', 'The ________ matrix is a tool used to prioritize tasks based on urgency and importance.', 'Eisenhower'),
  ('Management Trainee', 'fill_in_blank', 'The ________ theory suggests that employees are motivated by the expectation that their efforts will lead to desired outcomes.', 'expectancy');

-- Sales Exam Questions (Multiple Choice)
INSERT INTO questions (exam_type, question_type, question_text, options, correct_answer)
VALUES
  ('Sales', 'multiple_choice', 'Which of the following is NOT a stage in the typical sales process?', '["Prospecting", "Qualifying", "Presenting", "Manufacturing"]', '3'),
  ('Sales', 'multiple_choice', 'What is the primary purpose of a sales funnel?', '["To track customer complaints", "To visualize the sales process from lead to customer", "To manage inventory", "To calculate sales tax"]', '1'),
  ('Sales', 'multiple_choice', 'Which sales approach focuses on building long-term relationships rather than making quick sales?', '["Transactional selling", "Consultative selling", "Hard selling", "Direct selling"]', '1'),
  ('Sales', 'multiple_choice', 'What is a common method for handling sales objections?', '["Ignore the objection", "Argue with the customer", "Listen, understand, and respond", "Change the subject"]', '2'),
  ('Sales', 'multiple_choice', 'Which of the following is a key performance indicator (KPI) for sales?', '["Employee satisfaction", "Website traffic", "Conversion rate", "Production capacity"]', '2');

-- Sales Exam Questions (True/False)
INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES
  ('Sales', 'true_false', 'Cold calling is generally considered the most effective sales strategy in the digital age.', false),
  ('Sales', 'true_false', 'SPIN selling is a questioning technique used to uncover customer needs.', true),
  ('Sales', 'true_false', 'Cross-selling involves selling a more expensive version of a product to a customer.', false),
  ('Sales', 'true_false', 'A value proposition should focus on features rather than benefits.', false),
  ('Sales', 'true_false', 'Customer Relationship Management (CRM) systems are primarily used to track sales activities and customer interactions.', true);

-- Sales Exam Questions (Fill in the Blank)
INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES
  ('Sales', 'fill_in_blank', 'The process of identifying potential customers is called ________.', 'prospecting'),
  ('Sales', 'fill_in_blank', 'A ________ is a document that outlines the terms of a sale, including price, delivery date, and payment terms.', 'sales agreement'),
  ('Sales', 'fill_in_blank', 'The ________ close is a sales technique where the salesperson assumes the customer is ready to buy and proceeds with finalizing the sale.', 'assumptive'),
  ('Sales', 'fill_in_blank', 'The ________ is the percentage of leads that convert into customers.', 'conversion rate'),
  ('Sales', 'fill_in_blank', 'A ________ is a potential customer who has shown interest in a product or service.', 'lead');

-- QC Exam Questions (Multiple Choice)
INSERT INTO questions (exam_type, question_type, question_text, options, correct_answer)
VALUES
  ('QC', 'multiple_choice', 'Which of the following is NOT a principle of Total Quality Management (TQM)?', '["Customer focus", "Continuous improvement", "Employee involvement", "Minimal documentation"]', '3'),
  ('QC', 'multiple_choice', 'What does HACCP stand for in food safety?', '["Hazard Analysis and Critical Control Points", "High Accuracy Control and Prevention Process", "Handling and Cooking Control Procedures", "Health Assessment for Cooking and Processing"]', '0'),
  ('QC', 'multiple_choice', 'Which quality control tool is used to identify the vital few causes from the trivial many?', '["Fishbone diagram", "Pareto chart", "Flowchart", "Histogram"]', '1'),
  ('QC', 'multiple_choice', 'What is the purpose of a control chart in quality control?', '["To track inventory levels", "To monitor process variation over time", "To assign tasks to team members", "To calculate production costs"]', '1'),
  ('QC', 'multiple_choice', 'Which of the following is a key component of ISO 9001?', '["Financial management", "Marketing strategy", "Quality management system", "Human resources planning"]', '2');

-- QC Exam Questions (True/False)
INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES
  ('QC', 'true_false', 'Six Sigma is a methodology that aims to reduce defects to 3.4 per million opportunities.', true),
  ('QC', 'true_false', 'A Type I error in quality control occurs when a good product is incorrectly rejected.', true),
  ('QC', 'true_false', 'Kaizen is a Japanese term for radical, one-time improvements in quality.', false),
  ('QC', 'true_false', 'Statistical Process Control (SPC) is primarily used for financial auditing.', false),
  ('QC', 'true_false', 'The 5S methodology (Sort, Set in order, Shine, Standardize, Sustain) is a workplace organization method.', true);

-- QC Exam Questions (Fill in the Blank)
INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES
  ('QC', 'fill_in_blank', 'The ________ is a quality control tool that visually represents the relationship between a problem and its potential causes.', 'fishbone diagram'),
  ('QC', 'fill_in_blank', 'In quality control, ________ is the degree to which a set of inherent characteristics fulfills requirements.', 'quality'),
  ('QC', 'fill_in_blank', 'The ________ cycle (Plan-Do-Check-Act) is a four-step model for continuous improvement.', 'PDCA'),
  ('QC', 'fill_in_blank', 'A ________ is a systematic examination of a quality system performed by an internal or external quality auditor.', 'quality audit'),
  ('QC', 'fill_in_blank', 'The ________ is the maximum allowable difference between the actual dimension of a part and its nominal dimension.', 'tolerance');

-- Production Exam Questions (Multiple Choice)
INSERT INTO questions (exam_type, question_type, question_text, options, correct_answer)
VALUES
  ('Production', 'multiple_choice', 'Which production system was developed by Toyota?', '["Six Sigma", "Just-In-Time (JIT)", "Total Quality Management (TQM)", "Material Requirements Planning (MRP)"]', '1'),
  ('Production', 'multiple_choice', 'What is the primary goal of lean manufacturing?', '["Maximize inventory levels", "Eliminate waste", "Increase worker hours", "Reduce quality standards"]', '1'),
  ('Production', 'multiple_choice', 'Which of the following is NOT one of the 7 wastes identified in lean manufacturing?', '["Overproduction", "Waiting", "Innovation", "Transportation"]', '2'),
  ('Production', 'multiple_choice', 'What does OEE stand for in production management?', '["Overall Equipment Effectiveness", "Optimal Energy Efficiency", "Operational Excellence Evaluation", "Output Estimation Error"]', '0'),
  ('Production', 'multiple_choice', 'Which production layout is best suited for high-volume, standardized products?', '["Process layout", "Product layout", "Cellular layout", "Fixed position layout"]', '1');

-- Production Exam Questions (True/False)
INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES
  ('Production', 'true_false', 'Kanban is a scheduling system for lean manufacturing and just-in-time production.', true),
  ('Production', 'true_false', 'Batch production is more efficient than continuous production for all types of products.', false),
  ('Production', 'true_false', 'Preventive maintenance is performed after equipment failure occurs.', false),
  ('Production', 'true_false', 'The bottleneck in a production process determines the maximum throughput of the entire system.', true),
  ('Production', 'true_false', 'Work-in-progress (WIP) inventory is generally considered beneficial to maximize in lean production.', false);

-- Production Exam Questions (Fill in the Blank)
INSERT INTO questions (exam_type, question_type, question_text, correct_answer)
VALUES
  ('Production', 'fill_in_blank', 'The ________ time is the total time required to produce one unit from start to finish.', 'cycle'),
  ('Production', 'fill_in_blank', 'The ________ is a visual management tool that displays the status of work in a production process.', 'kanban board'),
  ('Production', 'fill_in_blank', 'The ________ is the rate at which a production system generates money through sales.', 'throughput'),
  ('Production', 'fill_in_blank', 'The ________ is a production planning system that uses bills of materials, inventory data, and the master production schedule to calculate material requirements.', 'MRP'),
  ('Production', 'fill_in_blank', 'The ________ is the time required to change a machine or process from producing one product to another.', 'setup time');
