package com.surajupadhye.interviewquestbackend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;

@Service
public class PdfExtractionService {

    public String extractTextFromPdfUrl(String pdfUrl) {
        if (pdfUrl == null || pdfUrl.isBlank()) {
            return "";
        }
        try (InputStream in = new URL(pdfUrl).openStream()) {
            byte[] bytes = in.readAllBytes();
            try (PDDocument document = Loader.loadPDF(bytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from PDF resume: " + e.getMessage(), e);
        }
    }
}
