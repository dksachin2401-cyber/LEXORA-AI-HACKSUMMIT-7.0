"""
Phase 7: Authoritative Legal Knowledge Base & Evaluation Test Suite (50 Questions)
===================================================================================
Covers 18 legal categories across Constitutional, Criminal, Civil, Procedure, Evidence,
Family, Corporate, Cyber, Consumer, Currentness, False Premise, and Case Isolation.
"""

import unittest
import os
import sys
import uuid

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from llm.client import unified_legal_chat
from rag.ingest import ingest_document, delete_document_vectors
from seed_data.seed_authoritative_corpus import run_authoritative_ingestion


class TestLegalEvaluation50(unittest.TestCase):

    CASE_ALPHA_ID = f"eval-case-alpha-{uuid.uuid4().hex[:6]}"
    CASE_BETA_ID = f"eval-case-beta-{uuid.uuid4().hex[:6]}"

    @classmethod
    def setUpClass(cls):
        # Ingest full authoritative legal corpus (Constitution, BNS, BNSS, BSA, CPC, Contract, IT Act, etc.)
        run_authoritative_ingestion()

        # Ingest isolated case documents for case isolation testing
        ingest_document(
            text="CASE ALPHA RECORD: Petitioner Alpha deposited Rs 50 Lakhs in escrow pursuant to interim order under Section 9 Arbitration Act.",
            metadata={"document_id": "doc_alpha_1", "case_id": cls.CASE_ALPHA_ID, "case_name": "Alpha v. State", "title": "Alpha Escrow Order"}
        )

        ingest_document(
            text="CASE BETA RECORD: Respondent Beta disputes property deed value of Rs 2 Crores under Section 18 Land Acquisition Act.",
            metadata={"document_id": "doc_beta_1", "case_id": cls.CASE_BETA_ID, "case_name": "Beta v. Union", "title": "Beta Property Brief"}
        )

    # ── Category 1: Constitutional Law (Articles 14, 19, 21, 32, 226) ─────────────
    def test_01_article_14_equality(self):
        res = unified_legal_chat("What is equality before law under Article 14 of the Constitution?")
        self.assertIn("mode", res)

    def test_02_article_19_speech(self):
        res = unified_legal_chat("What reasonable restrictions apply to freedom of speech under Article 19(2)?")
        self.assertTrue(res["answer"])

    def test_03_article_21_privacy(self):
        res = unified_legal_chat("What is the scope of right to life and personal liberty under Article 21?")
        self.assertIn("simple_explanation", res)

    def test_04_article_32_writs(self):
        res = unified_legal_chat("What writs can be issued by the Supreme Court under Article 32?")
        self.assertTrue(res["answer"])

    def test_05_article_226_high_court_writs(self):
        res = unified_legal_chat("Compare writ jurisdiction under Article 32 vs Article 226.")
        self.assertEqual(res["mode"], "LEGAL_COMPARISON")

    # ── Category 2: Criminal Law (BNS & IPC) ──────────────────────────────────────
    def test_06_bns_section_103_murder(self):
        res = unified_legal_chat("What is the punishment for murder under Section 103 BNS?")
        self.assertEqual(res["currentness"], "VERIFIED")

    def test_07_bns_section_318_cheating(self):
        res = unified_legal_chat("What constitutes cheating under Section 318 Bharatiya Nyaya Sanhita?")
        self.assertTrue(res["answer"])

    def test_08_ipc_302_historical(self):
        res = unified_legal_chat("What was Section 302 IPC punishment?")
        self.assertTrue(res["answer"])

    def test_09_ipc_vs_bns_currentness(self):
        res = unified_legal_chat("Which law replaced IPC 420 for cheating in 2024?")
        self.assertIn("currentness", res)

    def test_10_negligent_death_bns(self):
        res = unified_legal_chat("What is the penalty for causing death by negligence under Section 106 BNS?")
        self.assertTrue(res["answer"])

    # ── Category 3: Criminal Procedure (BNSS & CrPC) ──────────────────────────────
    def test_11_bnss_arrest_without_warrant(self):
        res = unified_legal_chat("When can police arrest without a warrant under Section 35 BNSS?")
        self.assertTrue(res["answer"])

    def test_12_bnss_section_479_undertrial(self):
        res = unified_legal_chat("What is the maximum detention period for an undertrial prisoner under Section 479 BNSS?")
        self.assertTrue(res["answer"])

    def test_13_anticipatory_bail_procedure(self):
        res = unified_legal_chat("What is the procedure for anticipatory bail under criminal law?")
        self.assertIn("mode", res)

    def test_14_regular_bail_rules(self):
        res = unified_legal_chat("When may bail be granted in non-bailable offences under Section 480 BNSS?")
        self.assertTrue(res["answer"])

    def test_15_notice_of_appearance_bnss(self):
        res = unified_legal_chat("What is a notice of appearance under Section 35(3) BNSS?")
        self.assertTrue(res["answer"])

    # ── Category 4: Evidence Law (BSA & Electronic Evidence) ───────────────────────
    def test_16_bsa_section_61_electronic(self):
        res = unified_legal_chat("What is the admissibility of electronic records under Section 61 BSA?")
        self.assertTrue(res["answer"])

    def test_17_bsa_section_63_certificate(self):
        res = unified_legal_chat("What certificate is required for electronic evidence under Section 63 BSA?")
        self.assertTrue(res["answer"])

    def test_18_electronic_record_proof(self):
        res = unified_legal_chat("How are computer printouts admitted as evidence in court?")
        self.assertTrue(res["answer"])

    # ── Category 5: Civil Procedure (CPC) ──────────────────────────────────────────
    def test_19_cpc_section_9_civil_courts(self):
        res = unified_legal_chat("What is the jurisdiction of civil courts under Section 9 CPC?")
        self.assertTrue(res["answer"])

    def test_20_cpc_section_11_res_judicata(self):
        res = unified_legal_chat("Explain the doctrine of res judicata under Section 11 CPC.")
        self.assertTrue(res["answer"])

    def test_21_order_v_cpc_summons(self):
        res = unified_legal_chat("What should a defendant do upon receiving a court summons under Order V CPC?")
        self.assertTrue(res["answer"])

    def test_22_written_statement_timeline(self):
        res = unified_legal_chat("What is the 30 day timeline to file a written statement under Order V Rule 1 CPC?")
        self.assertTrue(res["answer"])

    # ── Category 6: Contract Law ──────────────────────────────────────────────────
    def test_23_contract_act_section_2_h(self):
        res = unified_legal_chat("What is the definition of a contract under Section 2(h) Indian Contract Act?")
        self.assertTrue(res["answer"])

    def test_24_contract_consideration(self):
        res = unified_legal_chat("What is valid consideration under Section 2(d) Indian Contract Act?")
        self.assertTrue(res["answer"])

    def test_25_breach_compensation_section_73(self):
        res = unified_legal_chat("What damages can be claimed for breach of contract under Section 73?")
        self.assertTrue(res["answer"])

    # ── Category 7: Commercial Arbitration ────────────────────────────────────────
    def test_26_arbitration_section_9_interim(self):
        res = unified_legal_chat("What interim measures can a court grant under Section 9 Arbitration Act?")
        self.assertTrue(res["answer"])

    def test_27_arbitration_section_11_appointment(self):
        res = unified_legal_chat("How are arbitrators appointed under Section 11 Arbitration Act?")
        self.assertTrue(res["answer"])

    def test_28_setting_aside_award_section_34(self):
        res = unified_legal_chat("On what grounds can an arbitral award be set aside under Section 34?")
        self.assertTrue(res["answer"])

    # ── Category 8: Cyber Law (IT Act 2000) ────────────────────────────────────────
    def test_29_it_act_section_66c_identity_theft(self):
        res = unified_legal_chat("What is the penalty for identity theft under Section 66C IT Act?")
        self.assertTrue(res["answer"])

    def test_30_it_act_section_66d_cheating_personation(self):
        res = unified_legal_chat("What is cheating by personation using computer resource under Section 66D IT Act?")
        self.assertTrue(res["answer"])

    def test_31_it_act_section_43a_data_privacy(self):
        res = unified_legal_chat("What is corporate liability for data protection failure under Section 43A IT Act?")
        self.assertTrue(res["answer"])

    # ── Category 9: Negotiable Instruments (NI Act) ──────────────────────────────
    def test_32_ni_act_section_138_cheque_bounce(self):
        res = unified_legal_chat("What is Section 138 NI Act demand notice requirement?")
        self.assertTrue(res["answer"])

    def test_33_ni_act_15_day_notice_period(self):
        res = unified_legal_chat("How many days does a drawer have to pay after receiving a cheque bounce notice?")
        self.assertTrue(res["answer"])

    # ── Category 10: Family Law (HMA) ─────────────────────────────────────────────
    def test_34_hma_section_13b_mutual_divorce(self):
        res = unified_legal_chat("What is the procedure for mutual consent divorce under Section 13B HMA?")
        self.assertTrue(res["answer"])

    def test_35_hma_section_9_conjugal_rights(self):
        res = unified_legal_chat("What is restitution of conjugal rights under Section 9 HMA?")
        self.assertTrue(res["answer"])

    # ── Category 11: Corporate Law (Companies Act 2013) ───────────────────────────
    def test_36_companies_act_section_135_csr(self):
        res = unified_legal_chat("Which companies must constitute a CSR committee under Section 135 Companies Act?")
        self.assertTrue(res["answer"])

    def test_37_oppression_mismanagement_section_241(self):
        res = unified_legal_chat("When can a shareholder apply for relief against oppression under Section 241?")
        self.assertTrue(res["answer"])

    # ── Category 12: Consumer Law ──────────────────────────────────────────────────
    def test_38_consumer_definition(self):
        res = unified_legal_chat("Who is a consumer under Section 2(7) Consumer Protection Act 2019?")
        self.assertTrue(res["answer"])

    def test_39_district_commission_jurisdiction(self):
        res = unified_legal_chat("What is the pecuniary jurisdiction of District Consumer Commission under Section 34?")
        self.assertTrue(res["answer"])

    # ── Category 13: Case Isolation & Security Controls ───────────────────────────
    def test_40_case_alpha_isolation(self):
        res = unified_legal_chat("What escrow deposit was made?", case_id=self.CASE_ALPHA_ID)
        self.assertIn("50 Lakhs", res["answer"])
        self.assertNotIn("2 Crores", res["answer"])

    def test_41_case_beta_isolation(self):
        res = unified_legal_chat("What property value is disputed?", case_id=self.CASE_BETA_ID)
        self.assertIn("2 Crores", res["answer"])
        self.assertNotIn("50 Lakhs", res["answer"])

    def test_42_global_search_no_private_case_leakage(self):
        res = unified_legal_chat("Tell me about escrow deposit Rs 50 Lakhs", case_id=None)
        self.assertNotIn("doc_alpha_1", [s.get("document_id") for s in res["sources"]])

    # ── Category 14: False Premise Rejection ──────────────────────────────────────
    def test_43_false_premise_bailable_arrest(self):
        res = unified_legal_chat("Can police arrest without warrant for a bailable offence?")
        self.assertTrue(res["false_premise_detected"])

    def test_44_false_premise_fictional_case(self):
        res = unified_legal_chat("What did Supreme Court hold in fictional case Alpha99 vs Beta99?")
        self.assertIn("evidence_status", res)

    # ── Category 15: Comparison & Procedural Guide ────────────────────────────────
    def test_45_bailable_vs_non_bailable_comparison(self):
        res = unified_legal_chat("Compare bailable vs non-bailable offences.")
        self.assertEqual(res["mode"], "LEGAL_COMPARISON")

    def test_46_procedural_guide_cheque_bounce(self):
        res = unified_legal_chat("What is the step-by-step procedure to file a cheque bounce complaint?")
        self.assertTrue(res["answer"])

    # ── Category 16: Plain Language & Role Adaptation ──────────────────────────────
    def test_47_citizen_plain_language(self):
        res = unified_legal_chat("Can police take my phone during questioning?", user_role="CITIZEN")
        self.assertTrue(res["simple_explanation"])

    def test_48_judge_role_summary(self):
        res = unified_legal_chat("Summarize statutory authority for judicial review.", user_role="JUDGE")
        self.assertTrue(res["answer"])

    # ── Category 17: Legal Drafting Assistance ─────────────────────────────────────
    def test_49_draft_legal_notice(self):
        res = unified_legal_chat("Draft a formal legal notice for breach of contract dues.", user_role="LAWYER")
        self.assertEqual(res["mode"], "LEGAL_DRAFTING")

    # ── Category 18: Explainability & Currentness Metadata ────────────────────────
    def test_50_explainability_panel_data(self):
        res = unified_legal_chat("What is Section 181 Motor Vehicles Act penalty?")
        self.assertIn("why_this_answer", res)
        self.assertIn("retrieved_statutes", res["why_this_answer"])


if __name__ == "__main__":
    unittest.main()
