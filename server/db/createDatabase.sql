/*Email data Table*/

CREATE TABLE email_data(                                                                                                                                    
    id SERIAL PRIMARY KEY,
    case_no VARCHAR (250) UNIQUE NOT NULL,
    type VARCHAR (250) ,
    sub_type VARCHAR (250) ,
    subject VARCHAR (250) ,
    text_body text ,
    month VARCHAR (250) ,
    created_at timestamp,
    created_by VARCHAR (250) ,
    is_batch_data VARCHAR (250)
    );
                       
CREATE TABLE classification(
    classification_id SERIAL PRIMARY KEY,
    id integer ,
    case_no VARCHAR (250) NOT NULL,
    classification VARCHAR (250) ,
    status VARCHAR (250) DEFAULT 'CORRECT',
    accuracy numeric ,
    review_status VARCHAR (250) DEFAULT 'OPEN',
    is_user_input_required VARCHAR (250) ,
    response_template text
    );

CREATE TABLE review(
    case_id SERIAL PRIMARY KEY,
    classification_id integer ,
    case_no VARCHAR (250) NOT NULL,
    username VARCHAR (250),
    last_updated_at timestamp,
    last_updated_by VARCHAR (250),
    status VARCHAR (250) DEFAULT 'OPEN',
    went_for_review_at timestamp
    );

/*

insert into classification (id,case_no) select id, case_no from email_data where case_no=ANY(array['27215677','26665063','26253724','19806060','22789305','24996999','18151702','25031904','19008015','24965901','27022960','18236178','27381502','26339964','25333827','26048508','22192498','24752921','27149934','18895883','25362262','24965901','19492334','24123817','23422660','27519887','26521690','26265610','21981964']);


ALTER TABLE classification 
ADD COLUMN review_status VARCHAR(250) DEFAULT 'OPEN';


*/

UPDATE
    classification
SET
    classification.id = e.id
FROM
    classification c
INNER JOIN
    email_data e
ON 
    c.case_no = e.case_no;