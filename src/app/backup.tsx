import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ProductScreen } from '@/components/product-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFamiliasRepository } from '@/database/use-familias-repository';
import {
  exportarPlanilhaBackup,
  formatarDataUltimoBackup,
  lerUltimoBackupEm,
  selecionarArquivoPlanilha,
} from '@/features/familias/backup-file-service';
import {
  analisarPlanilhaBackup,
  type BackupImportPreview,
} from '@/features/familias/backup-xlsx';
import { BackupImportPreviewModal } from '@/features/familias/components/backup-import-preview-modal';
import type { Familia } from '@/features/familias/types';
import { useTheme } from '@/hooks/use-theme';

type FeedbackState = {
  kind: 'success' | 'error';
  message: string;
};

export default function BackupScreen() {
  const theme = useTheme();
  const repository = useFamiliasRepository();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [ultimoBackupEm, setUltimoBackupEm] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
  const [analisando, setAnalisando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [previewState, setPreviewState] = useState<{
    fileName: string;
    preview: BackupImportPreview;
  } | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      const [lista, ultimaData] = await Promise.all([
        repository.listar(),
        lerUltimoBackupEm(),
      ]);
      setFamilias(lista);
      setUltimoBackupEm(ultimaData);
    } catch (error) {
      setFeedback({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os dados para backup.',
      });
    }
  }, [repository]);

  useFocusEffect(
    useCallback(() => {
      void carregarDados();
    }, [carregarDados])
  );

  const handleExportar = async () => {
    try {
      setExportando(true);
      setFeedback(null);
      const { nomeArquivo, dataIso } = await exportarPlanilhaBackup(familias);
      setUltimoBackupEm(dataIso);
      setFeedback({
        kind: 'success',
        message: `Planilha ${nomeArquivo} preparada com ${familias.length} ${
          familias.length === 1 ? 'família' : 'famílias'
        }.`,
      });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível exportar a planilha de backup.',
      });
    } finally {
      setExportando(false);
    }
  };

  const handleEscolherArquivo = async () => {
    try {
      setAnalisando(true);
      setFeedback(null);
      const arquivo = await selecionarArquivoPlanilha();
      if (!arquivo) return;

      const preview = analisarPlanilhaBackup(arquivo.bytes, familias);
      setPreviewState({ fileName: arquivo.nomeArquivo, preview });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível ler a planilha selecionada.',
      });
    } finally {
      setAnalisando(false);
    }
  };

  const handleConfirmarImportacao = async () => {
    if (!previewState) return;

    try {
      setImportando(true);
      const itens = previewState.preview.validas.map((row) => row.item);
      const { criados, atualizados } = await repository.importarLote(itens);
      const ignoradas = previewState.preview.invalidas.length;

      setPreviewState(null);
      await carregarDados();

      const partesResumo: string[] = [];
      if (criados > 0) {
        partesResumo.push(`${criados} ${criados === 1 ? 'nova' : 'novas'}`);
      }
      if (atualizados > 0) {
        partesResumo.push(
          `${atualizados} ${atualizados === 1 ? 'atualizada' : 'atualizadas'}`
        );
      }
      if (ignoradas > 0) {
        partesResumo.push(`${ignoradas} ${ignoradas === 1 ? 'ignorada' : 'ignoradas'}`);
      }

      setFeedback({
        kind: 'success',
        message: `Importação concluída: ${partesResumo.join(' · ')}.`,
      });
    } catch (error) {
      setFeedback({
        kind: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar os dados importados.',
      });
      setPreviewState(null);
    } finally {
      setImportando(false);
    }
  };

  return (
    <ProductScreen
      title="Backup"
      description="Exporte suas famílias em planilha ou restaure uma cópia de segurança.">
      {feedback ? (
        <View
          style={[
            styles.feedbackBanner,
            {
              backgroundColor:
                feedback.kind === 'error' ? theme.dangerSoft : theme.primarySoft,
            },
          ]}>
          <AppIcon
            name={feedback.kind === 'error' ? 'warning' : 'check'}
            color={feedback.kind === 'error' ? theme.danger : theme.primary}
            size={20}
          />
          <ThemedText
            type="smallBold"
            style={[
              styles.feedbackText,
              { color: feedback.kind === 'error' ? theme.danger : theme.primary },
            ]}>
            {feedback.message}
          </ThemedText>
        </View>
      ) : null}

      <ThemedView
        type="backgroundElement"
        style={[styles.card, { borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: theme.primarySoft }]}>
            <AppIcon name="table" color={theme.primary} size={22} />
          </View>
          <View style={styles.cardCopy}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Exportar dados
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Gera uma planilha Excel (.xlsx) com todas as famílias cadastradas ({familias.length}{' '}
              {familias.length === 1 ? 'família' : 'famílias'}).
            </ThemedText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={exportando}
          onPress={() => void handleExportar()}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: theme.primary,
              opacity: exportando ? 0.6 : pressed ? 0.78 : 1,
            },
          ]}>
          <AppIcon name="table" color="#FFFFFF" size={20} />
          <ThemedText type="smallBold" style={styles.primaryButtonText}>
            {exportando ? 'Gerando planilha…' : 'Exportar para Excel (.xlsx)'}
          </ThemedText>
        </Pressable>

        <View style={styles.lastBackupRow}>
          <AppIcon
            name={ultimoBackupEm ? 'check' : 'info'}
            color={ultimoBackupEm ? theme.primary : theme.textSecondary}
            size={16}
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.lastBackupText}>
            {formatarDataUltimoBackup(ultimoBackupEm)}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView
        type="backgroundElement"
        style={[styles.card, { borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: '#D8F0F7' }]}>
            <AppIcon name="restore" color="#12627A" size={22} />
          </View>
          <View style={styles.cardCopy}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Importar dados
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Restaure ou atualize os cadastros a partir de uma planilha de backup (.xlsx) gerada
              anteriormente.
            </ThemedText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={analisando}
          onPress={() => void handleEscolherArquivo()}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              backgroundColor: theme.input,
              borderColor: theme.border,
              opacity: analisando ? 0.6 : pressed ? 0.78 : 1,
            },
          ]}>
          <AppIcon name="folder" color={theme.text} size={20} />
          <ThemedText type="smallBold">
            {analisando ? 'Lendo planilha…' : 'Escolher arquivo (.xlsx)'}
          </ThemedText>
        </Pressable>
      </ThemedView>

      <View
        style={[
          styles.privacyBanner,
          { backgroundColor: theme.primarySoft, borderColor: theme.border },
        ]}>
        <AppIcon name="lock" color={theme.primary} size={20} />
        <ThemedText type="small" style={[styles.privacyText, { color: theme.text }]}>
          Esta planilha contém dados pessoais. Compartilhe somente com pessoas de confiança.
        </ThemedText>
      </View>

      <BackupImportPreviewModal
        visible={previewState !== null}
        fileName={previewState?.fileName ?? ''}
        preview={previewState?.preview ?? null}
        importing={importando}
        onCancel={() => setPreviewState(null)}
        onConfirm={() => void handleConfirmarImportacao()}
      />
    </ProductScreen>
  );
}

const styles = StyleSheet.create({
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 18,
    padding: Spacing.three,
  },
  feedbackText: {
    flex: 1,
  },
  card: {
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 24,
    padding: Spacing.four,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  cardIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  primaryButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
  },
  lastBackupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  lastBackupText: {
    flex: 1,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
  },
  privacyText: {
    flex: 1,
  },
});
