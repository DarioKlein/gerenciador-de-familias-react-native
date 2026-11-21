import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { BackupImportPreview } from '@/features/familias/backup-xlsx';
import { useTheme } from '@/hooks/use-theme';

type BackupImportPreviewModalProps = {
  visible: boolean;
  fileName: string;
  preview: BackupImportPreview | null;
  importing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function BackupImportPreviewModal({
  visible,
  fileName,
  preview,
  importing,
  onCancel,
  onConfirm,
}: BackupImportPreviewModalProps) {
  const theme = useTheme();
  if (!preview) return null;

  const canConfirm = preview.validas.length > 0 && !importing;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={importing ? undefined : onCancel}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <ThemedView
          type="backgroundElement"
          accessibilityViewIsModal
          style={[styles.sheet, { borderColor: theme.border }]}>
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: theme.primarySoft }]}>
              <AppIcon name="table" color={theme.primary} size={22} />
            </View>
            <View style={styles.headerCopy}>
              <ThemedText
                type="subtitle"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}>
                Resumo do backup
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {fileName}
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar pré-visualização"
              disabled={importing}
              onPress={onCancel}
              style={[styles.closeButton, { backgroundColor: theme.input }]}>
              <AppIcon name="close" color={theme.textSecondary} size={20} />
            </Pressable>
          </View>

          <View style={styles.summaryGrid}>
            <View style={[styles.summaryBox, { backgroundColor: theme.primarySoft }]}>
              <ThemedText style={[styles.summaryCount, { color: theme.primary }]}>
                {preview.novasCount}
              </ThemedText>
              <ThemedText
                type="smallBold"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={{ color: theme.primary }}>
                {preview.novasCount === 1 ? 'Nova' : 'Novas'}
              </ThemedText>
            </View>

            <View style={[styles.summaryBox, { backgroundColor: '#D8F0F7' }]}>
              <ThemedText style={[styles.summaryCount, { color: '#12627A' }]}>
                {preview.atualizacoesCount}
              </ThemedText>
              <ThemedText
                type="smallBold"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={{ color: '#12627A' }}>
                Atualizar
              </ThemedText>
            </View>

            <View
              style={[
                styles.summaryBox,
                {
                  backgroundColor:
                    preview.invalidas.length > 0 ? theme.dangerSoft : theme.input,
                },
              ]}>
              <ThemedText
                style={[
                  styles.summaryCount,
                  {
                    color:
                      preview.invalidas.length > 0 ? theme.danger : theme.textSecondary,
                  },
                ]}>
                {preview.invalidas.length}
              </ThemedText>
              <ThemedText
                type="smallBold"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={{
                  color:
                    preview.invalidas.length > 0 ? theme.danger : theme.textSecondary,
                }}>
                {preview.invalidas.length === 1 ? 'Inválida' : 'Inválidas'}
              </ThemedText>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollList}>
            {preview.invalidas.length > 0 ? (
              <View style={[styles.invalidCard, { backgroundColor: theme.dangerSoft }]}>
                <View style={styles.invalidHeader}>
                  <AppIcon name="warning" color={theme.danger} size={18} />
                  <ThemedText type="smallBold" style={{ color: theme.danger }}>
                    Linhas inválidas (não serão salvas)
                  </ThemedText>
                </View>
                {preview.invalidas.map((row) => (
                  <View
                    key={`${row.linha}-${row.nomeExibicao}`}
                    style={[
                      styles.invalidItem,
                      { backgroundColor: theme.backgroundElement },
                    ]}>
                    <ThemedText type="smallBold" style={{ color: theme.danger }}>
                      Linha {row.linha} · {row.nomeExibicao}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {row.motivos.join(' ')}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}

            {preview.validas.length > 0 ? (
              <View style={styles.validList}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Registros prontos para importar ({preview.validas.length})
                </ThemedText>
                {preview.validas.map((row) => {
                  const isUpdate = row.acao === 'atualizar';
                  return (
                    <View
                      key={`${row.linha}-${row.item.id}`}
                      style={[
                        styles.validItem,
                        { backgroundColor: theme.background, borderColor: theme.border },
                      ]}>
                      <View style={styles.validItemCopy}>
                        <ThemedText type="smallBold" numberOfLines={1}>
                          {row.item.nome}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                          {[row.item.endereco, row.item.numero, row.item.bairro]
                            .filter(Boolean)
                            .join(', ')}
                        </ThemedText>
                      </View>
                      <View
                        style={[
                          styles.actionPill,
                          {
                            backgroundColor: isUpdate ? '#D8F0F7' : theme.primarySoft,
                          },
                        ]}>
                        <ThemedText
                          type="smallBold"
                          style={{
                            color: isUpdate ? '#12627A' : theme.primary,
                          }}>
                          {isUpdate ? 'Atualizar' : 'Novo'}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={[styles.emptyValidBox, { backgroundColor: theme.input }]}>
                <ThemedText type="smallBold">Nenhum registro válido encontrado</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyValidCopy}>
                  Corrija os motivos indicados na planilha antes de tentar importar novamente.
                </ThemedText>
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={importing}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.input, opacity: pressed ? 0.75 : 1 },
              ]}>
              <ThemedText type="smallBold">Cancelar</ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={!canConfirm}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: canConfirm ? theme.primary : theme.input,
                  opacity: !canConfirm ? 0.6 : pressed ? 0.78 : 1,
                },
              ]}>
              <ThemedText
                type="smallBold"
                style={{ color: canConfirm ? '#FFFFFF' : theme.textSecondary }}>
                {importing
                  ? 'Importando…'
                  : `Importar (${preview.validas.length})`}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.three,
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '86%',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 28,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  summaryCount: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  scrollList: {
    gap: Spacing.three,
  },
  invalidCard: {
    gap: Spacing.two,
    borderRadius: 18,
    padding: Spacing.three,
  },
  invalidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  invalidItem: {
    gap: Spacing.half,
    borderRadius: 12,
    padding: Spacing.two,
  },
  validList: {
    gap: Spacing.two,
  },
  validItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
  },
  validItemCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  actionPill: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  emptyValidBox: {
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: 18,
    padding: Spacing.four,
  },
  emptyValidCopy: {
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
  },
});
