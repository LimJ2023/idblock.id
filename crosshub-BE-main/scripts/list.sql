<select id="dclzGroupManageDAO.selectDclzLateGroupManageList" parameterClass="HashMap" resultClass="egovMap">
		SELECT T5.EMP_ID, 
			   T5.EMP_DEPT_CD,
		       T5.EMP_DEPT_NM,
		       T5.JOB_DEPT,
		       T5.EMP_NM,
		       T5.EMP_RPOF_NM,
			   T5.COMMUTE_TY_NM,
		       SUM(COMMUTE_COUNT) AS COMMUTE_COUNT,
		       SUM(COMMUTE_COUNT2) AS COMMUTE_COUNT2,
		       SUM(COMMUTE_RM_COUNT) AS COMMUTE_RM_COUNT,
		       SUM(COMMUTE_RM_COUNT2) AS COMMUTE_RM_COUNT2
		FROM (
		SELECT T4.EMP_ID,
			   T4.EMP_DEPT_CD,
		       T4.EMP_DEPT_NM,
		       T4.JOB_DEPT,
		       T4.EMP_NM,
		       T4.EMP_RPOF_CD,
		       T4.EMP_RPOF_NM,
			   STRING_AGG(T4.COMMUTE_TY_NM, ', ') OVER (PARTITION BY T4.EMP_DEPT_CD, T4.EMP_DEPT_NM, T4.EMP_NM, T4.EMP_RPOF_NM) AS COMMUTE_TY_NM,
		       SUM(CASE WHEN T4.COMMUTE_YN = 'Y'  THEN 1 ELSE 0 END) AS COMMUTE_COUNT,
		       SUM(CASE WHEN T4.COMMUTE_YN = '츨입로그 없음' THEN 1 ELSE 0 END) AS COMMUTE_COUNT2,
		       SUM(CASE WHEN T4.COMMUTE_RM_YN = 'Y'  THEN 1 ELSE 0 END) AS COMMUTE_RM_COUNT,
		       SUM(CASE WHEN T4.COMMUTE_RM_YN = '출입로그 없음' THEN 1 ELSE 0 END) AS COMMUTE_RM_COUNT2
		FROM (SELECT T1.EMP_ID,
						T1.EMP_DEPT_CD,
				        (SELECT DEPT_NM FROM APMS_DEV.DEPT WHERE DEPT_CD = T1.EMP_DEPT_CD) AS EMP_DEPT_NM,
			    		(CASE WHEN (SELECT STRING_AGG((SELECT DEPT_NM FROM APMS_DEV.DEPT WHERE DEPT_CD = E1.JOB_DEPT_CD), ',' ORDER BY E1.EXC_ENDDE)
													    FROM APMS_DEV.TB_JOB_EXC_DEPT_DE AS E1
													    WHERE E1.EMP_ID = T1.EMP_ID
															AND (E1.EXC_BGNDE <![CDATA[<=]]> TO_CHAR(TO_DATE(#endDate#, 'YYYY-MM-DD'), 'YYYYMMDD') AND E1.EXC_ENDDE <![CDATA[>=]]> TO_CHAR(TO_DATE(#startDate#, 'YYYY-MM-DD'), 'YYYYMMDD'))) IS NULL 
						     THEN '사업지원그룹'
						     ELSE (SELECT STRING_AGG((SELECT DEPT_NM FROM APMS_DEV.DEPT WHERE DEPT_CD = E1.JOB_DEPT_CD), ',' ORDER BY E1.EXC_ENDDE)
								    FROM APMS_DEV.TB_JOB_EXC_DEPT_DE AS E1
								    WHERE E1.EMP_ID = T1.EMP_ID
										AND (E1.EXC_BGNDE <![CDATA[<=]]> TO_CHAR(TO_DATE(#endDate#, 'YYYY-MM-DD'), 'YYYYMMDD') AND E1.EXC_ENDDE <![CDATA[>=]]> TO_CHAR(TO_DATE(#startDate#, 'YYYY-MM-DD'), 'YYYYMMDD')))
						     END) AS JOB_DEPT,
				        T1.EMP_NM,
		       			T1.EMP_RPOF_CD,
				        (SELECT CMMN_CD_NM FROM APMS_DEV.TB_CMMN_CD WHERE CMMN_CL_CD = 'RPOF' AND CMMN_CD = T1.EMP_RPOF_CD) AS EMP_RPOF_NM,
						(SELECT CMMN_CD_NM FROM ABS_DEV.TB_CMMN_CD WHERE CMMN_CL_CD = 'TMDIFF_COMMUTE_TY_CD' AND CMMN_CD = COMMUTE_TY) AS COMMUTE_TY_NM,
						TO_CHAR(TO_DATE(T2.DATE, 'YYYYMMDD'), 'YYYY-MM-DD') AS DATE,
						(CASE WHEN T2.IN_TIME IS NOT NULL THEN CONCAT(LPAD(CAST(SUBSTRING(T2.IN_TIME, 1, 2) AS TEXT), 2, '0'), ':',
												        	          LPAD(CAST(SUBSTRING(T2.IN_TIME, 3, 2) AS TEXT), 2, '0'), ':',
													                  LPAD(CAST(SUBSTRING(T2.IN_TIME, 5, 2) AS TEXT), 2, '0')) 
						ELSE T2.IN_TIME END) AS IN_TIME_FORMAT,
						(CASE WHEN T2.OUT_TIME IS NOT NULL THEN CONCAT(LPAD(CAST(SUBSTRING(T2.OUT_TIME, 1, 2) AS TEXT), 2, '0'), ':',
												        	     	   LPAD(CAST(SUBSTRING(T2.OUT_TIME, 3, 2) AS TEXT), 2, '0'), ':',
													             	   LPAD(CAST(SUBSTRING(T2.OUT_TIME, 5, 2) AS TEXT), 2, '0')) 
						ELSE T2.OUT_TIME END) AS OUT_TIME_FORMAT,
						(CASE WHEN CONCAT(T2.TMDIFF_APPLC_BGN_TIME, '0100') <![CDATA[<=]]>T2.IN_TIME THEN (CASE WHEN T2.DATE IN (SELECT RSTDE FROM	APMS_DEV.TB_RSTDE WHERE	RSTDE = T2.DATE) THEN '공휴일' ELSE 'Y' END)
							  WHEN T2.IN_TIME IS NULL OR T2.IN_TIME = '' THEN (CASE WHEN T2.DATE IN (SELECT RSTDE FROM APMS_DEV.TB_RSTDE WHERE RSTDE = T2.DATE) THEN '공휴일' ELSE '츨입로그 없음' END)
							  ELSE '' END) AS COMMUTE_YN,
						T3.DCLZ_DE,
						T3.DCLZ_TY,
						(SELECT CMMN_CD_NM FROM ABS_DEV.TB_CMMN_CD WHERE CMMN_CL_CD = 'DCLZ_TY_CD' AND CMMN_CD = T3.DCLZ_TY) AS DCLZ_TY_NM,
						T3.DCLZ_RM,
						(CASE WHEN T3.DCLZ_TY IS NULL OR T3.DCLZ_TY NOT IN ('DTC01', 'DTC06', 'DTC07', 'DTC08', 'DTC11') 
							 THEN (CASE WHEN CONCAT((CASE WHEN T3.DCLZ_TY = 'DTC02' THEN (T2.TMDIFF_APPLC_BGN_TIME::INTEGER + 5)::TEXT
															WHEN T3.DCLZ_TY = 'DTC04' THEN (T2.TMDIFF_APPLC_BGN_TIME::INTEGER + 2)::TEXT
															WHEN T3.DCLZ_TY = 'DTC10' THEN '09'
													    ELSE T2.TMDIFF_APPLC_BGN_TIME END), '0100') <![CDATA[<=]]> T2.IN_TIME THEN (CASE WHEN T2.DATE IN (SELECT RSTDE FROM	APMS_DEV.TB_RSTDE WHERE	RSTDE = T2.DATE) THEN '공휴일' ELSE 'Y' END)
										  WHEN T2.IN_TIME IS NULL OR T2.IN_TIME = '' THEN (CASE WHEN T2.DATE IN (SELECT RSTDE FROM APMS_DEV.TB_RSTDE WHERE RSTDE = T2.DATE) THEN '공휴일' ELSE '출입로그 없음' END)
										  ELSE '' END) 
						 ELSE '' END)AS COMMUTE_RM_YN
				FROM APMS_DEV.EMPL AS T1
				LEFT JOIN (
							SELECT I1.EMP_ID,
							       I1.DATE,
							       I1.COMMUTE_TY,
							       I1.COMMUTE_TY_NM,
							       I1.TMDIFF_APPLC_BGN_TIME,
							       I1.TMDIFF_APPLC_END_TIME,
							       I2.ATIME AS IN_TIME,
							       I3.ATIME AS OUT_TIME,
							       I2.EQNAME AS IN_GATE_NAME,
							       I3.EQNAME AS OUT_GATE_NAME
							FROM (SELECT E.EMP_ID, 
									     TO_CHAR(D, 'YYYYMMDD') AS DATE,
									     (SELECT COMMUTE_TY FROM ABS_DEV.TB_TMDIFF_COMMUTE_INFO WHERE (TO_CHAR(D, 'YYYYMMDD') BETWEEN TMDIFF_APPLC_BGNDE AND TMDIFF_APPLC_ENDDE) AND EMP_ID = E.EMP_ID) AS COMMUTE_TY, 
										 (SELECT CMMN_CD_NM FROM ABS_DEV.TB_CMMN_CD WHERE CMMN_CL_CD = 'TMDIFF_COMMUTE_TY_CD' AND CMMN_CD = (SELECT COMMUTE_TY FROM ABS_DEV.TB_TMDIFF_COMMUTE_INFO WHERE (TO_CHAR(D, 'YYYYMMDD') BETWEEN TMDIFF_APPLC_BGNDE AND TMDIFF_APPLC_ENDDE) AND EMP_ID = E.EMP_ID)) AS COMMUTE_TY_NM,
										 LPAD(REGEXP_REPLACE(SPLIT_PART((SELECT CMMN_CD_NM FROM ABS_DEV.TB_CMMN_CD WHERE CMMN_CL_CD = 'TMDIFF_COMMUTE_TY_CD' AND CMMN_CD = (SELECT COMMUTE_TY FROM ABS_DEV.TB_TMDIFF_COMMUTE_INFO WHERE (TO_CHAR(D, 'YYYYMMDD') BETWEEN TMDIFF_APPLC_BGNDE AND TMDIFF_APPLC_ENDDE) AND EMP_ID = E.EMP_ID)), '-', 1) , '[^0-9]+', '', 'g'), 2, '0') AS TMDIFF_APPLC_BGN_TIME, 
										 LPAD(REGEXP_REPLACE(SPLIT_PART((SELECT CMMN_CD_NM FROM ABS_DEV.TB_CMMN_CD WHERE CMMN_CL_CD = 'TMDIFF_COMMUTE_TY_CD' AND CMMN_CD = (SELECT COMMUTE_TY FROM ABS_DEV.TB_TMDIFF_COMMUTE_INFO WHERE (TO_CHAR(D, 'YYYYMMDD') BETWEEN TMDIFF_APPLC_BGNDE AND TMDIFF_APPLC_ENDDE) AND EMP_ID = E.EMP_ID)), '-', 2) , '[^0-9]+', '', 'g'), 2, '0') AS TMDIFF_APPLC_END_TIME
								  FROM generate_series(
								  						<isEmpty property="startDate">
														    <isEmpty property="endDate">
														        '20250101'::date, CURRENT_DATE::date, '1 day'::interval
														    </isEmpty>
														</isEmpty>
														<isEmpty property="startDate">
														    <isNotEmpty property="endDate">
														        '20250101'::date, TO_CHAR(TO_DATE(#endDate#, 'YYYY-MM-DD'), 'YYYYMMDD')::date, '1 day'::interval
														    </isNotEmpty>
														</isEmpty>
														<isNotEmpty property="startDate">
														    <isEmpty property="endDate">
														        TO_CHAR(TO_DATE(#startDate#, 'YYYY-MM-DD'), 'YYYYMMDD')::date, CURRENT_DATE::date, '1 day'::interval
														    </isEmpty>
														</isNotEmpty>
													    <isNotEmpty property="startDate">
													    	<isNotEmpty property="endDate">
																TO_CHAR(TO_DATE(#startDate#, 'YYYY-MM-DD'), 'YYYYMMDD')::date, TO_CHAR(TO_DATE(#endDate#, 'YYYY-MM-DD'), 'YYYYMMDD')::date, '1 day'::interval
															</isNotEmpty>
														</isNotEmpty>
													  ) AS D
								  LEFT JOIN APMS_DEV.EMPL AS E
								  ON TRUE
								  WHERE EXTRACT(DOW FROM D) NOT IN (0, 6)) AS I1
							LEFT JOIN (SELECT A1.EMP_ID,
											   A1.ADATE,
											   A1.ATIME, 
											   A1.EQNAME
										FROM (SELECT T1.CARDNUM ,    
													 (CASE WHEN (T1.ATIME  <![CDATA[>=]]> '040000' AND T1.ATIME  <![CDATA[<=]]> '235959') THEN T1.ADATE 
												           WHEN (T1.ATIME  <![CDATA[>=]]> '000000' AND T1.ATIME  <![CDATA[<]]> '040000') THEN 
												               TO_CHAR(TO_TIMESTAMP(T1.ADATE, 'YYYYMMDD') - INTERVAL '1 day', 'YYYYMMDD') 
												     END) AS ADATE, 
											         T1.ATIME,
											         RIGHT(T1.STATE, 1) AS STATE,
											         ROW_NUMBER() OVER(PARTITION BY (CASE WHEN (T1.ATIME <![CDATA[>=]]>'040000' AND T1.ATIME <![CDATA[<=]]>'235959') THEN T1.ADATE 
																				          WHEN (T1.ATIME <![CDATA[>=]]>'000000' AND T1.ATIME <![CDATA[<]]>'040000') THEN 
																				               TO_CHAR(TO_TIMESTAMP(T1.ADATE, 'YYYYMMDD') - INTERVAL '1 day', 'YYYYMMDD')
																				     END)
											         					, T2.EMP_ID, RIGHT(T1.STATE, 1) 
											         				   ORDER BY ADATE ASC, ATIME ASC ) AS ROW_NUM,
											         T1.EQNAME,
											         T2.EMP_ID
											  FROM PUBLIC.SECOM_ALARM AS T1
											  LEFT JOIN (SELECT S1.*, 
														        S2.EMP_ID
													  	  FROM (SELECT * FROM PUBLIC.SECOM_CARD
													  	  		UNION ALL
													  	  		SELECT * FROM PUBLIC.SECOM_CARD_BEFORE) AS S1
														  LEFT JOIN APMS_DEV.EMPL AS S2
														  ON S1.NAME LIKE CONCAT(S2.EMP_NM, '%')) AS T2
											  ON T1.CARDNUM = T2.CARDNO
												  AND RIGHT(T1.STATE, 1) = '0'
												  <isEmpty property="startDate">
												      <isNotEmpty property="endDate">
												    	  AND T1.ADATE <![CDATA[<=]]> TO_CHAR(TO_DATE(#endDate#, 'YYYY-MM-DD'), 'YYYYMMDD')
												      </isNotEmpty>
											  	  </isEmpty>
												  <isNotEmpty property="startDate">
												      <isEmpty property="endDate">
												      	  AND T1.ADATE <![CDATA[>=]]> TO_CHAR(TO_DATE(#startDate#, 'YYYY-MM-DD'), 'YYYYMMDD')
												      </isEmpty>
												   </isNotEmpty>