package com.tech.api.service;

import com.tech.api.dto.IssueDraft;
import com.tech.api.entity.Message;
import com.tech.api.entity.Topic;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class IssueDraftAiService {

    public enum OutputLang { EN, AUTO_SAME_AS_INPUT }

    public IssueDraft draft(Topic topic, List<Message> messages, OutputLang out) {
        Lang lang = detectLang(messages);

        String label = detectPrimaryLabel(topic, messages, lang);
        List<Message> top = pickTopMessages(messages);

        String summary = buildSummary(topic, messages, label, lang, out);
        String expected = extractExpected(messages, lang);
        String actual = extractActual(messages, lang);
        List<String> steps = extractSteps(messages, lang);

        List<String> todo = buildTodo(label, topic.getTitle(), lang, out);

        String body = buildBody(topic, summary, label, expected, actual, steps, top, todo, lang, out);

        List<String> labels = new ArrayList<>();
        labels.add(label);
        String area = guessArea(messages);
        if (area != null) labels.add(area);

        return new IssueDraft(topic.getTitle(), body, labels);
    }

    // ---------- language ----------
    private enum Lang { EN, SKCZ }

    private Lang detectLang(List<Message> messages) {
        String t = allText(messages);

        // slovenské/české diakritiky + typické slová
        if (Pattern.compile("[áäčďéíľĺňóôŕřšťúýžěů]").matcher(t).find()) return Lang.SKCZ;
        if (containsAny(t, "nefunguje", "chyba", "problém", "problem", "malo by", "má byť", "ocakav", "očakáv")) return Lang.SKCZ;

        return Lang.EN;
    }

    // ---------- labels ----------
    private String detectPrimaryLabel(Topic topic, List<Message> messages, Lang lang) {
        String text = (safe(topic.getTitle()) + "\n" + allText(messages)).toLowerCase(Locale.ROOT);

        if (containsAny(text,
                "bug", "error", "exception", "crash", "fails", "not working", "doesn't work",
                "chyba", "nefunguje", "padá", "spadne", "výnimka", "vynimka", "rozbité", "rozbite", "problem", "problém"
        )) return "bug";

        if (containsAny(text,
                "feature", "add", "implement", "support", "should have", "would be nice",
                "funkcia", "funkcionalita", "pridať", "pridat", "doplniť", "implementovať", "implementovat", "podpora", "chcem", "bolo by fajn",
                "dark mode", "dark theme"
        )) return "feature";

        if (containsAny(text,
                "refactor", "cleanup", "optimize", "chore", "tech debt",
                "refaktor", "upratať", "upratat", "optimaliz", "technický dlh", "technicky dlh"
        )) return "chore";

        return "discussion";
    }

    private String guessArea(List<Message> messages) {
        String t = allText(messages);
        if (containsAny(t, "frontend", "ui", "mui", "react")) return "frontend";
        if (containsAny(t, "backend", "spring", "api", "controller", "service")) return "backend";
        if (containsAny(t, "websocket", "ws", "stomp")) return "websocket";
        if (containsAny(t, "db", "database", "jpa", "hibernate")) return "database";
        return null;
    }

    // ---------- expected/actual ----------
    private String extractExpected(List<Message> messages, Lang lang) {
        List<String> keys = (lang == Lang.SKCZ)
                ? List.of("malo by", "má byť", "ma byt", "očakávam", "ocakavam", "ideálne", "idealne", "musí", "musi", "potrebujeme", "chcem aby")
                : List.of("should", "expected", "ideally", "must", "need to", "we want");

        return findFirstMessageContaining(messages, keys);
    }

    private String extractActual(List<Message> messages, Lang lang) {
        List<String> keys = (lang == Lang.SKCZ)
                ? List.of("aktuálne", "aktualne", "deje sa", "stáva sa", "stava sa", "niekedy", "teraz", "momentálne", "momentalne", "v realite")
                : List.of("currently", "happens", "sometimes", "now", "in reality", "actually");

        // fallback pre bugy: ak nenájde "aktuálne", stačí prvá “problémová” veta
        String s = findFirstMessageContaining(messages, keys);
        if (s != null) return s;

        return findFirstMessageContaining(messages, List.of("nefunguje", "chyba", "problem", "problém", "error", "exception", "crash"));
    }

    // ---------- steps ----------
    private List<String> extractSteps(List<Message> messages, Lang lang) {
        String text = allTextRaw(messages);

        // 1) ... / 1. ... / 1- ...
        Pattern p = Pattern.compile("(^|\\n)\\s*(\\d+\\)|\\d+\\.|\\d+\\-)\\s+([^\\n]+)");
        var m = p.matcher(text);

        List<String> steps = new ArrayList<>();
        while (m.find() && steps.size() < 8) {
            steps.add(m.group(3).trim());
        }

        // fallback: "keď/when ... tak/then ..."
        if (steps.isEmpty()) {
            for (Message msg : messages) {
                String c = safe(msg.getContent()).toLowerCase(Locale.ROOT);
                if ((lang == Lang.SKCZ && (c.contains("keď") || c.contains("ked"))) || (lang == Lang.EN && c.contains("when"))) {
                    steps.add(msg.getContent().trim());
                    if (steps.size() >= 3) break;
                }
            }
        }

        return steps;
    }

    // ---------- todo ----------
    private List<String> buildTodo(String label, String title, Lang lang, OutputLang out) {
        boolean en = (out == OutputLang.EN) || (out == OutputLang.AUTO_SAME_AS_INPUT && lang == Lang.EN);

        if ("bug".equals(label)) {
            return en
                    ? List.of("Reproduce the issue", "Identify root cause", "Fix: " + shorten(title), "Add automated test", "Verify on mobile/desktop")
                    : List.of("Zreprodukovať problém", "Nájsť príčinu", "Opraviť: " + shorten(title), "Pridať test", "Overiť na mobile/desktope");
        }
        if ("feature".equals(label)) {
            return en
                    ? List.of("Define requirements & UX", "Implement: " + shorten(title), "Add tests", "Update documentation")
                    : List.of("Upresniť požiadavky & UX", "Implementovať: " + shorten(title), "Pridať testy", "Aktualizovať dokumentáciu");
        }
        if ("chore".equals(label)) {
            return en
                    ? List.of("Refactor relevant parts", "Add regression tests", "Verify behavior/performance")
                    : List.of("Refaktorovať relevantné časti", "Pridať regresné testy", "Overiť správanie/výkon");
        }
        return en ? List.of("Decide next steps") : List.of("Dohodnúť ďalšie kroky");
    }

    // ---------- body ----------
    private String buildSummary(Topic topic, List<Message> messages, String label, Lang lang, OutputLang out) {
        boolean en = (out == OutputLang.EN) || (out == OutputLang.AUTO_SAME_AS_INPUT && lang == Lang.EN);

        String base = switch (label) {
            case "bug" -> en ? "Discussion indicates a problem that should be fixed." : "Diskusia naznačuje problém, ktorý treba opraviť.";
            case "feature" -> en ? "Discussion proposes a new feature to implement." : "Diskusia navrhuje novú funkcionalitu na implementáciu.";
            case "chore" -> en ? "Discussion suggests technical improvements/refactoring." : "Diskusia navrhuje technické zlepšenia/refaktor.";
            default -> en ? "Discussion captured in this topic." : "Diskusia zachytená v tejto téme.";
        };

        String area = guessArea(messages);
        if (area != null) return base + (en ? " Area: " : " Oblasť: ") + area + ".";
        return base;
    }

    private String buildBody(
            Topic topic,
            String summary,
            String label,
            String expected,
            String actual,
            List<String> steps,
            List<Message> topMessages,
            List<String> todo,
            Lang lang,
            OutputLang out
    ) {
        boolean en = (out == OutputLang.EN) || (out == OutputLang.AUTO_SAME_AS_INPUT && lang == Lang.EN);

        String hSummary = en ? "### Summary" : "### Zhrnutie";
        String hType = en ? "### Type" : "### Typ";
        String hActual = en ? "### Actual" : "### Aktuálne správanie";
        String hExpected = en ? "### Expected" : "### Očakávané správanie";
        String hSteps = en ? "### Steps to reproduce" : "### Kroky na reprodukciu";
        String hEvidence = en ? "### Evidence (top messages)" : "### Dôkazy (najrelevantnejšie správy)";
        String hTodo = en ? "### TODO" : "### TODO";

        StringBuilder sb = new StringBuilder();
        sb.append(hSummary).append("\n").append(summary).append("\n\n");
        sb.append(hType).append("\n").append(label).append("\n\n");

        if (actual != null) sb.append(hActual).append("\n").append(actual).append("\n\n");
        if (expected != null) sb.append(hExpected).append("\n").append(expected).append("\n\n");

        if (!steps.isEmpty()) {
            sb.append(hSteps).append("\n");
            for (int i = 0; i < steps.size(); i++) sb.append(i + 1).append(". ").append(steps.get(i)).append("\n");
            sb.append("\n");
        }

        sb.append(hEvidence).append("\n");
        for (Message m : topMessages) {
            sb.append("- ").append(m.getFrom().getUsername()).append(": ").append(m.getContent()).append("\n");
        }
        sb.append("\n");

        sb.append(hTodo).append("\n");
        for (String t : todo) sb.append("- [ ] ").append(t).append("\n");
        sb.append("\n");

        sb.append(en ? "_Generated from chat topic: " : "_Vygenerované z chat témy: ")
                .append(topic.getId()).append("_\n");

        return sb.toString();
    }

    // ---------- helpers ----------
    private List<Message> pickTopMessages(List<Message> messages) {
        return messages.stream()
                .map(m -> new ScoredMessage(m, score(m.getContent())))
                .sorted(Comparator.comparingInt(ScoredMessage::score).reversed())
                .limit(5)
                .map(ScoredMessage::message)
                .toList();
    }

    private int score(String content) {
        if (content == null) return 0;
        String c = content.toLowerCase(Locale.ROOT);

        int s = Math.min(content.length() / 20, 8);
        if (containsAny(c, "bug","error","exception","crash","fails","nefunguje","chyba","výnimka","vynimka","padá","spadne","problém","problem")) s += 6;
        if (containsAny(c, "should","expected","ideally","malo by","má byť","ma byt","očakávam","ocakavam","idealne")) s += 4;
        if (containsAny(c, "steps","reproduce","when i","then","kroky","reproduk","keď","ked","tak")) s += 4;
        return s;
    }

    private String findFirstMessageContaining(List<Message> messages, List<String> keywords) {
        for (Message m : messages) {
            String c = safe(m.getContent());
            String lc = c.toLowerCase(Locale.ROOT);
            for (String k : keywords) {
                if (lc.contains(k)) return c.trim();
            }
        }
        return null;
    }

    private String allText(List<Message> messages) {
        return messages.stream()
                .map(Message::getContent)
                .filter(Objects::nonNull)
                .collect(Collectors.joining("\n"))
                .toLowerCase(Locale.ROOT);
    }

    private String allTextRaw(List<Message> messages) {
        return messages.stream()
                .map(Message::getContent)
                .filter(Objects::nonNull)
                .collect(Collectors.joining("\n"));
    }

    private boolean containsAny(String text, String... keys) {
        for (String k : keys) if (text.contains(k)) return true;
        return false;
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private String shorten(String title) {
        if (title == null) return "";
        return title.length() <= 60 ? title : title.substring(0, 57) + "...";
    }

    private record ScoredMessage(Message message, int score) {}
}
